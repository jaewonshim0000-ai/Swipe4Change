-- Communities become collaboration spaces rather than one chat log.
--
-- Three zones with different authority:
--   discussion    — members post, anyone can read
--   announcements — the owner and moderators post in the community's voice, anyone can read
--   organizers    — a private working room only moderators can read or post in
--
-- Nine surfaces from one record: a calendar is events sorted by date, a task board is tasks
-- grouped by status, a channel is a filter. Adding nine tables would have meant nine sets of RLS
-- policies to get right; this way the same row-level rules cover all of them.
--
-- Reporter identity is never returned to moderators. Naming the reporter turns a moderation
-- request into a confrontation between neighbours, and the moderator does not need it to judge
-- the post. Poll and proposal ledgers are private for the same reason: counts are public, choices
-- are not.
begin;

alter table public.discussion_posts
  drop constraint if exists discussion_posts_kind_check;
alter table public.discussion_posts
  add constraint discussion_posts_kind_check check(kind in
    ('question','idea','experience','announcement','event','task','poll','proposal','document'));
alter table public.discussion_posts
  add column if not exists space text not null default 'discussion'
    check(space in ('discussion','announcements','organizers')),
  add column if not exists channel text not null default '' check(length(channel) <= 40),
  add column if not exists event_at timestamptz,
  add column if not exists location text not null default '' check(length(location) <= 120),
  add column if not exists task_status text check(task_status in ('open','claimed','done')),
  add column if not exists claimed_by uuid references public.profiles(id),
  add column if not exists options text[],
  add column if not exists url text check(url is null or url like 'https://%');

create index if not exists posts_community_space on public.discussion_posts(community_id, space);

-- Who chose what. Private by design; only the aggregate leaves these tables.
create table if not exists public.post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.discussion_posts(id),
  user_id uuid not null references public.profiles(id),
  choice text not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id));

create table if not exists public.post_positions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.discussion_posts(id),
  user_id uuid not null references public.profiles(id),
  position text not null check(position in ('support','oppose')),
  created_at timestamptz not null default now(),
  unique(post_id, user_id));

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id),
  post_id uuid not null references public.discussion_posts(id),
  user_id uuid not null references public.profiles(id),
  reason text not null check(length(reason) between 10 and 500),
  status text not null default 'open' check(status in ('open','actioned','dismissed')),
  created_at timestamptz not null default now(),
  unique(post_id, user_id));

alter table public.post_votes enable row level security;
alter table public.post_positions enable row level security;
alter table public.post_reports enable row level security;
-- Default deny. You can see your own ledger row; nobody reads anyone else's directly, and the
-- moderator queue arrives through a security-definer function that drops the reporter.
create policy own_votes on public.post_votes for select using(user_id = private.actor());
create policy own_positions on public.post_positions for select using(user_id = private.actor());
create policy own_post_reports on public.post_reports for select using(user_id = private.actor());

-- The organizer space never leaves the moderator group, so the read policy has to know about it.
drop policy if exists posts_read on public.discussion_posts;
create policy posts_read on public.discussion_posts for select using(
  not archived
  and (space <> 'organizers' or private.moderates(community_id, private.actor()))
  and (private.visible(petition_id)
       or exists(select 1 from public.communities c where c.id=community_id and not c.archived)));

create or replace function private.community_post(p public.discussion_posts, author text, uid uuid)
 returns jsonb language sql stable set search_path='' as $fn$
 select private.authored(
   private.entry(p.id, p.body, author, p.created_at,
     case when p.removed then 'removed' else p.kind end),
   p.author_id, p.removed)
 || jsonb_build_object('communityId',p.community_id,'space',p.space,'channel',p.channel)
 || case when p.event_at is null then '{}'::jsonb
      else jsonb_build_object('eventAt',p.event_at,'location',p.location) end
 || case when p.task_status is null then '{}'::jsonb
      else jsonb_build_object('taskStatus',p.task_status,'claimedName',
        coalesce((select name from public.profiles where id=p.claimed_by),'')) end
 || case when p.options is null then '{}'::jsonb
      else jsonb_build_object('options',to_jsonb(p.options),
        'votes',(select coalesce(jsonb_object_agg(o, (select count(*) from public.post_votes v
                   where v.post_id=p.id and v.choice=o)),'{}'::jsonb) from unnest(p.options) o),
        'myVote',(select v.choice from public.post_votes v where v.post_id=p.id and v.user_id=uid)) end
 || case when p.kind <> 'proposal' then '{}'::jsonb
      else jsonb_build_object(
        'support',(select count(*) from public.post_positions x where x.post_id=p.id and x.position='support'),
        'oppose',(select count(*) from public.post_positions x where x.post_id=p.id and x.position='oppose'),
        'myPosition',(select x.position from public.post_positions x where x.post_id=p.id and x.user_id=uid)) end
 || case when p.url is null then '{}'::jsonb else jsonb_build_object('url',p.url) end $fn$;

create or replace function public.lookaware_community_posts(community_id uuid) returns jsonb
 language sql stable security definer set search_path='' as $fn$
 select coalesce(jsonb_agg(private.community_post(p,u.name,private.actor()) order by p.created_at),'[]')
 from public.discussion_posts p
 join public.profiles u on u.id=p.author_id
 join public.communities c on c.id=p.community_id
 where p.community_id=lookaware_community_posts.community_id and not p.archived and not c.archived
   and (p.space <> 'organizers' or private.moderates(p.community_id, private.actor())) $fn$;
revoke all on function public.lookaware_community_posts(uuid) from public,anon,authenticated;
grant execute on function public.lookaware_community_posts(uuid) to anon,authenticated;

-- Moderator queue. The reporter's id is selected but never projected.
create or replace function public.lookaware_community_reports(community_id uuid) returns jsonb
 language plpgsql security definer set search_path='' as $fn$
declare result jsonb;
begin
 if not private.moderates(lookaware_community_reports.community_id, private.actor()) then
  raise exception 'Only this community owner and its moderators can review reports.'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'id',r.id,'communityId',r.community_id,'postId',r.post_id,'postBody',p.body,
   'postAuthor',u.name,'reason',r.reason,'status',r.status,'date',r.created_at)
   order by r.created_at desc),'[]'::jsonb)
 into result from public.post_reports r
 join public.discussion_posts p on p.id=r.post_id
 join public.profiles u on u.id=p.author_id
 where r.community_id=lookaware_community_reports.community_id;
 return result;
end $fn$;
revoke all on function public.lookaware_community_reports(uuid) from public,anon;
grant execute on function public.lookaware_community_reports(uuid) to authenticated;

alter function public.lookaware_command(jsonb) rename to lookaware_command_v7;
revoke all on function public.lookaware_command_v7(jsonb) from public,anon,authenticated;
create function public.lookaware_command(command jsonb) returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=private.actor(); kind text:=command->>'type'; cid uuid; pst public.discussion_posts;
        opts text[]; mods boolean; prev text; rep public.post_reports;
begin
 if uid is null then raise exception 'Sign in before making changes.'; end if;
 if kind in ('communityPost','communityInteract','reportPost','resolvePostReport') then
  cid:=(command->>'communityId')::uuid;
  if not exists(select 1 from public.communities where id=cid and not archived) then
   raise exception 'Community not found.'; end if;
  mods:=private.moderates(cid,uid);
 end if;

 if kind='communityPost' then
  if not exists(select 1 from public.community_members where community_id=cid and user_id=uid and active) then
   raise exception 'Join the community to post.'; end if;
  if not mods and (command->>'space' is distinct from 'discussion' or command->>'kind'='announcement') then
   raise exception 'Only this community owner and its moderators can post here. Try the public discussion.'; end if;
  if command->>'kind'='announcement' and command->>'space' is distinct from 'announcements' then
   raise exception 'Announcements belong in the announcements space.'; end if;
  if command->>'kind'='poll' then
   -- Blank lines are the composer splitting on newlines, so they are dropped. Author order is
   -- preserved, and an actual duplicate is a mistake worth telling the author about.
   select array_agg(v order by ord) into opts from (
     select trim(value) v, ord from jsonb_array_elements_text(command->'options') with ordinality as t(value,ord)
     where trim(value)<>'') x;
   if opts is null or cardinality(opts) not between 2 and 6 then raise exception 'Give a poll 2 to 6 choices.'; end if;
   if (select count(distinct u) from unnest(opts) u) <> cardinality(opts) then raise exception 'Poll choices must differ.'; end if;
  end if;
  if command->>'kind'='event' and (command->>'eventAt' is null or command->>'eventAt'='') then
   raise exception 'Give the event a date.'; end if;
  if command->>'kind'='document' and coalesce(command->>'url','') not like 'https://%' then
   raise exception 'Share an https:// link.'; end if;
  insert into public.discussion_posts(community_id,author_id,kind,body,space,channel,event_at,location,task_status,options,url)
  values(cid,uid,command->>'kind',command->>'body',coalesce(command->>'space','discussion'),
    left(coalesce(trim(command->>'channel'),''),40),
    case when command->>'kind'='event' then (command->>'eventAt')::timestamptz end,
    left(coalesce(command->>'location',''),120),
    case when command->>'kind'='task' then 'open' end,
    case when command->>'kind'='poll' then opts end,
    case when command->>'kind'='document' then command->>'url' end);
  return null;
 end if;

 if kind='communityInteract' then
  if not exists(select 1 from public.community_members where community_id=cid and user_id=uid and active) then
   raise exception 'Join the community to take part.'; end if;
  select * into pst from public.discussion_posts where id=(command->>'postId')::uuid and community_id=cid for update;
  if not found then raise exception 'That post is no longer here.'; end if;
  if pst.removed then raise exception 'That post was removed.'; end if;
  if command->>'action'='vote' then
   if pst.options is null then raise exception 'That post is not a poll.'; end if;
   if not (command->>'option' = any(pst.options)) then raise exception 'Choose one of the listed options.'; end if;
   select choice into prev from public.post_votes where post_id=pst.id and user_id=uid;
   if prev=command->>'option' then raise exception 'You already chose that option.'; end if;
   insert into public.post_votes(post_id,user_id,choice) values(pst.id,uid,command->>'option')
    on conflict (post_id,user_id) do update set choice=excluded.choice;
   return null;
  end if;
  if command->>'action' in ('support','oppose','withdraw') then
   if pst.kind<>'proposal' then raise exception 'That post is not a proposal.'; end if;
   select position into prev from public.post_positions where post_id=pst.id and user_id=uid;
   if command->>'action'='withdraw' then
    if prev is null then raise exception 'You have not taken a position on this proposal.'; end if;
    delete from public.post_positions where post_id=pst.id and user_id=uid;
    return null;
   end if;
   if prev=command->>'action' then raise exception 'You already took that position.'; end if;
   insert into public.post_positions(post_id,user_id,position) values(pst.id,uid,command->>'action')
    on conflict (post_id,user_id) do update set position=excluded.position;
   return null;
  end if;
  if pst.kind<>'task' then raise exception 'That post is not a task.'; end if;
  if command->>'action'='claim' then
   if pst.task_status is distinct from 'open' then raise exception 'Someone is already on this task.'; end if;
   update public.discussion_posts set task_status='claimed', claimed_by=uid where id=pst.id;
   return null;
  end if;
  -- Releasing and completing belong to whoever took the task on, or a moderator unblocking a board.
  if pst.claimed_by is distinct from uid and not mods then
   raise exception 'Only the person who claimed this can change it.'; end if;
  if command->>'action'='release' then
   if pst.task_status is distinct from 'claimed' then raise exception 'This task is not claimed.'; end if;
   update public.discussion_posts set task_status='open', claimed_by=null where id=pst.id;
   return null;
  end if;
  if pst.task_status='done' then raise exception 'This task is already done.'; end if;
  update public.discussion_posts set task_status='done' where id=pst.id;
  return null;
 end if;

 if kind='reportPost' then
  select * into pst from public.discussion_posts where id=(command->>'postId')::uuid and community_id=cid;
  if not found then raise exception 'That post is no longer here.'; end if;
  if exists(select 1 from public.post_reports where post_id=pst.id and user_id=uid) then
   raise exception 'You already reported this post.'; end if;
  if length(coalesce(trim(command->>'reason'),''))<10 then
   raise exception 'Say what is wrong in at least 10 characters.'; end if;
  insert into public.post_reports(community_id,post_id,user_id,reason)
   values(cid,pst.id,uid,left(trim(command->>'reason'),500));
  return null;
 end if;

 if kind='resolvePostReport' then
  if not mods then raise exception 'Only this community owner and its moderators can review reports.'; end if;
  select * into rep from public.post_reports where id=(command->>'reportId')::uuid and community_id=cid for update;
  if not found then raise exception 'That report is no longer here.'; end if;
  if rep.status<>'open' then raise exception 'That report was already reviewed.'; end if;
  if command->>'action' not in ('actioned','dismissed') then raise exception 'Choose a review outcome.'; end if;
  update public.post_reports set status=command->>'action' where id=rep.id;
  return null;
 end if;

 return public.lookaware_command_v7(command);
end $$;
revoke all on function public.lookaware_command(jsonb) from public,anon;
grant execute on function public.lookaware_command(jsonb) to authenticated;

commit;
