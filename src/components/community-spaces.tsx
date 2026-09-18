import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Community,
  CommunityPost,
  CommunitySpace,
  Petition,
  PostKind,
  Profile,
  postKindLabels,
} from '../domain/model';
import { useBackend, useCommand } from '../data/provider';
import { Button, Chip, Confirm, Field, Icon, Notice, Panel, colors, fonts, styles } from './ui';
import { Avatar, KindBadge } from './design-system';

/**
 * Every community surface is the same record filtered three ways: which space it lives in, what
 * kind it is, and which channel it was posted to. One list, one composer, nine views.
 */
const views = [
  {
    id: 'Discussion',
    space: 'discussion',
    kinds: ['question', 'idea', 'experience'],
    moderatorOnly: false,
  },
  { id: 'Announcements', space: 'announcements', kinds: ['announcement'], moderatorOnly: false },
  { id: 'Calendar', space: 'discussion', kinds: ['event'], moderatorOnly: false },
  { id: 'Tasks', space: 'discussion', kinds: ['task'], moderatorOnly: false },
  { id: 'Polls', space: 'discussion', kinds: ['poll'], moderatorOnly: false },
  { id: 'Proposals', space: 'discussion', kinds: ['proposal'], moderatorOnly: false },
  { id: 'Documents', space: 'discussion', kinds: ['document'], moderatorOnly: false },
  {
    id: 'Organizer space',
    space: 'organizers',
    kinds: ['question', 'idea', 'task', 'event', 'poll', 'proposal', 'document'],
    moderatorOnly: true,
  },
] as const satisfies readonly {
  id: string;
  space: CommunitySpace;
  kinds: readonly PostKind[];
  moderatorOnly?: boolean;
}[];
type ViewId = (typeof views)[number]['id'];

const blurbs: Record<ViewId | 'Campaign updates' | 'Reports', string> = {
  Discussion: 'Anyone can read this. Members post questions, ideas and first-hand experience.',
  Announcements:
    'Posted in the community’s voice by its owner and moderators. Members read but do not post here.',
  Calendar: 'Local coordination. Fictional demo events — nothing here is a real gathering.',
  Tasks: 'Claim one thing you will actually do. Release it if plans change; nobody is chased.',
  Polls:
    'Counts are public; who voted for what is not. Polls inform a decision, they do not make one.',
  Proposals: 'A proposal a community can weigh. Positions are reversible until it is acted on.',
  Documents:
    'Shared https:// links only — no uploads. Links are member-supplied and are not fact-checked.',
  'Organizer space':
    'A private working room for the owner and moderators. Members cannot read this space.',
  'Campaign updates':
    'Updates written by the organizers of this community\u2019s petitions. Read-only here \u2014 they are posted from the petition, and everyone following it is notified.',
  Reports:
    'Reports on posts in this community. The reporter is never named to you: reporting a neighbour should not become a confrontation.',
};

function Meta({ post }: { post: CommunityPost }) {
  return (
    <View style={[styles.row, { gap: 10, flexWrap: 'nowrap' }]}>
      <Avatar name={post.author} size={34} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={[styles.row, { gap: 8 }]}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink }}>
            {post.author}
          </Text>
          <KindBadge label={postKindLabels[post.kind as PostKind] ?? post.kind} />
        </View>
        <Text style={styles.micro}>
          {new Date(post.date).toLocaleDateString()}
          {post.channel ? ` · #${post.channel}` : ''}
        </Text>
      </View>
    </View>
  );
}

function Bar({ value, total }: { value: number; total: number }) {
  return (
    <View
      style={{ height: 6, backgroundColor: colors.pale, borderRadius: 6, overflow: 'hidden' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: Math.max(1, total), now: value }}
    >
      <View
        style={{
          width: `${total ? (100 * value) / total : 0}%`,
          height: '100%',
          backgroundColor: colors.sage,
        }}
      />
    </View>
  );
}

function Post({
  post,
  community,
  profile,
  joined,
  moderates,
  onRemove,
  onReport,
}: {
  post: CommunityPost;
  community: Community;
  profile: Profile | null;
  joined: boolean;
  moderates: boolean;
  onRemove: (post: CommunityPost) => void;
  onReport: (post: CommunityPost) => void;
}) {
  const m = useCommand();
  const act = (
    action: 'vote' | 'claim' | 'release' | 'complete' | 'support' | 'oppose' | 'withdraw',
    option?: string,
  ) =>
    m.mutate({
      type: 'communityInteract',
      communityId: community.id,
      postId: post.id,
      action,
      option,
    });
  const votes = Object.values(post.votes ?? {}).reduce((a, b) => a + b, 0);
  const positions = (post.support ?? 0) + (post.oppose ?? 0);
  return (
    <View style={{ gap: 8, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line }}>
      <Meta post={post} />
      <Text style={post.removed ? styles.muted : styles.body}>{post.body}</Text>
      {post.kind === 'event' && !!post.eventAt && (
        <View style={[styles.row, { gap: 6 }]}>
          <Icon name="calendar-outline" size={14} />
          <Text style={styles.small}>
            {new Date(post.eventAt).toLocaleString()}
            {post.location ? ` · ${post.location}` : ''}
          </Text>
        </View>
      )}
      {post.kind === 'document' && !!post.url && (
        <Button
          title="Open shared link"
          icon="open-outline"
          variant="secondary"
          onPress={() => {
            void Linking.openURL(post.url ?? '');
          }}
        />
      )}
      {post.kind === 'task' && (
        <View style={[styles.row, { gap: 8 }]}>
          <Chip
            label={
              post.taskStatus === 'done'
                ? 'Done'
                : post.taskStatus === 'claimed'
                  ? `Claimed by ${post.claimedName}`
                  : 'Open'
            }
          />
          {joined && post.taskStatus === 'open' && (
            <Button
              title="Claim"
              variant="secondary"
              disabled={m.isPending}
              onPress={() => act('claim')}
            />
          )}
          {joined && post.taskStatus === 'claimed' && (
            <>
              <Button
                title="Mark done"
                variant="secondary"
                disabled={m.isPending}
                onPress={() => act('complete')}
              />
              <Button
                title="Release"
                variant="ghost"
                disabled={m.isPending}
                onPress={() => act('release')}
              />
            </>
          )}
        </View>
      )}
      {!!post.options?.length && (
        <View style={{ gap: 8 }}>
          {post.options.map((o) => (
            <View key={o} style={{ gap: 4 }}>
              <View style={styles.between}>
                <Text style={[styles.small, post.myVote === o && { color: colors.accent }]}>
                  {post.myVote === o ? '● ' : ''}
                  {o}
                </Text>
                <Text style={styles.micro}>{post.votes?.[o] ?? 0}</Text>
              </View>
              <Bar value={post.votes?.[o] ?? 0} total={Math.max(1, votes)} />
              {joined && post.myVote !== o && (
                <Button
                  title={`Choose ${o}`}
                  variant="ghost"
                  disabled={m.isPending}
                  onPress={() => act('vote', o)}
                />
              )}
            </View>
          ))}
          <Text style={styles.micro}>
            {votes} {votes === 1 ? 'vote' : 'votes'} · your choice is not shown to anyone else
          </Text>
        </View>
      )}
      {post.kind === 'proposal' && (
        <View style={{ gap: 8 }}>
          <View style={styles.between}>
            <Text style={styles.small}>Support {post.support ?? 0}</Text>
            <Text style={styles.small}>Oppose {post.oppose ?? 0}</Text>
          </View>
          <Bar value={post.support ?? 0} total={Math.max(1, positions)} />
          {joined && (
            <View style={styles.row}>
              <Button
                title={post.myPosition === 'support' ? 'Supporting' : 'Support'}
                variant={post.myPosition === 'support' ? 'primary' : 'secondary'}
                disabled={m.isPending || post.myPosition === 'support'}
                onPress={() => act('support')}
              />
              <Button
                title={post.myPosition === 'oppose' ? 'Opposing' : 'Oppose'}
                variant="secondary"
                disabled={m.isPending || post.myPosition === 'oppose'}
                onPress={() => act('oppose')}
              />
              {!!post.myPosition && (
                <Button
                  title="Withdraw"
                  variant="ghost"
                  disabled={m.isPending}
                  onPress={() => act('withdraw')}
                />
              )}
            </View>
          )}
        </View>
      )}
      {!post.removed && (
        <View style={styles.row}>
          {(moderates || (!!profile && post.authorId === profile.id)) && (
            <Button title="Remove" variant="ghost" onPress={() => onRemove(post)} />
          )}
          {joined && !!profile && post.authorId !== profile.id && (
            <Button title="Report" variant="ghost" onPress={() => onReport(post)} />
          )}
        </View>
      )}
      {m.error && <Notice error text={m.error.message} />}
    </View>
  );
}

function Composer({
  community,
  view,
  channel,
}: {
  community: Community;
  view: (typeof views)[number];
  channel: string;
}) {
  const m = useCommand();
  const [kind, setKind] = useState<PostKind>(view.kinds[0]);
  const [body, setBody] = useState('');
  const [eventAt, setEventAt] = useState('');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState('');
  const [newChannel, setNewChannel] = useState(channel);
  return (
    <View style={{ gap: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line }}>
      {view.kinds.length > 1 && (
        <View style={styles.row}>
          {view.kinds.map((k) => (
            <Chip
              key={k}
              label={postKindLabels[k]}
              selected={kind === k}
              onPress={() => setKind(k)}
            />
          ))}
        </View>
      )}
      <Field
        label={`Add ${postKindLabels[kind].toLowerCase()}`}
        multiline
        value={body}
        onChangeText={setBody}
        placeholder="What do you want the community to know?"
      />
      {kind === 'event' && (
        <>
          <Field
            label="When (YYYY-MM-DD HH:MM)"
            value={eventAt}
            onChangeText={setEventAt}
            placeholder="2026-10-04 18:30"
          />
          <Field
            label="Where"
            value={location}
            onChangeText={setLocation}
            placeholder="Riverton library, room 2"
          />
        </>
      )}
      {kind === 'document' && (
        <Field
          label="Link (https://)"
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.org/plan.pdf"
        />
      )}
      {kind === 'poll' && (
        <Field
          label="Choices, one per line"
          multiline
          value={options}
          onChangeText={setOptions}
          placeholder={'Weeknight\nWeekend morning\nWeekend afternoon'}
        />
      )}
      <Field
        label="Channel (optional)"
        value={newChannel}
        onChangeText={setNewChannel}
        placeholder="lighting"
      />
      <Button
        title={`Post ${postKindLabels[kind].toLowerCase()}`}
        disabled={m.isPending || body.trim().length < 5}
        onPress={() =>
          m.mutate(
            {
              type: 'communityPost',
              communityId: community.id,
              body,
              kind,
              space: view.space,
              channel: newChannel.trim(),
              ...(kind === 'event' ? { eventAt: eventAt.trim().replace(' ', 'T'), location } : {}),
              ...(kind === 'document' ? { url: url.trim() } : {}),
              ...(kind === 'poll'
                ? {
                    options: options
                      .split('\n')
                      .map((o) => o.trim())
                      .filter(Boolean),
                  }
                : {}),
            },
            {
              onSuccess: () => {
                setBody('');
                setEventAt('');
                setLocation('');
                setUrl('');
                setOptions('');
              },
            },
          )
        }
      />
      {m.error && <Notice error text={m.error.message} />}
    </View>
  );
}

function Reports({ community }: { community: Community }) {
  const { adapter } = useBackend();
  const m = useCommand();
  const q = useQuery({
    queryKey: ['community-reports', community.id],
    queryFn: () => adapter.communityReports(community.id),
  });
  if (q.isPending) return <Text style={styles.muted}>Loading reports…</Text>;
  if (q.error) return <Notice error text={q.error.message} />;
  if (!q.data?.length) return <Text style={styles.muted}>No posts have been reported.</Text>;
  return (
    <>
      {q.data.map((r) => (
        <View
          key={r.id}
          style={{ gap: 6, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line }}
        >
          <View style={[styles.row, { gap: 8 }]}>
            <Chip label={r.status} />
            <Text style={styles.micro}>{new Date(r.date).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.body}>{r.reason}</Text>
          <Text style={styles.small}>
            Reported post by {r.postAuthor}: “{r.postBody}”
          </Text>
          {r.status === 'open' && (
            <View style={styles.row}>
              <Button
                title="Mark actioned"
                variant="secondary"
                disabled={m.isPending}
                onPress={() =>
                  m.mutate({
                    type: 'resolvePostReport',
                    communityId: community.id,
                    reportId: r.id,
                    action: 'actioned',
                  })
                }
              />
              <Button
                title="Dismiss"
                variant="ghost"
                disabled={m.isPending}
                onPress={() =>
                  m.mutate({
                    type: 'resolvePostReport',
                    communityId: community.id,
                    reportId: r.id,
                    action: 'dismissed',
                  })
                }
              />
            </View>
          )}
          {m.error && <Notice error text={m.error.message} />}
        </View>
      ))}
      <Notice text="Marking a report actioned records the review. Removing the post itself is a separate, visible step so the thread keeps its tombstone." />
    </>
  );
}

function CampaignUpdates({ petitions }: { petitions: Petition[] }) {
  const updates = petitions
    .flatMap((p) => p.updates.map((u) => ({ ...u, title: p.title, petitionId: p.id })))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  if (!updates.length)
    return (
      <Text style={styles.muted}>
        No organizer has posted an update on this community’s petitions yet.
      </Text>
    );
  return (
    <>
      {updates.map((u) => (
        <View
          key={u.id}
          style={{ gap: 6, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line }}
        >
          <Text style={[styles.label, { fontSize: 10 }]}>ORGANIZER UPDATE</Text>
          <Text style={styles.cardTitle}>{u.title}</Text>
          <Text style={u.removed ? styles.muted : styles.body}>{u.body}</Text>
          <Text style={styles.micro}>
            {u.author} · {new Date(u.date).toLocaleDateString()}
          </Text>
          <Button
            title="Open the petition"
            variant="ghost"
            onPress={() => router.push(`/petition/${u.petitionId}`)}
          />
        </View>
      ))}
    </>
  );
}

export function CommunityWorkspace({
  community,
  petitions,
  profile,
  joined,
  moderates,
}: {
  community: Community;
  /** This community's petitions, for the read-only campaign-updates zone. */
  petitions: Petition[];
  profile: Profile | null;
  joined: boolean;
  moderates: boolean;
}) {
  const { adapter } = useBackend();
  const m = useCommand();
  const posts = useQuery({
    queryKey: ['posts', community.id],
    queryFn: () => adapter.communityPosts(community.id),
  });
  const [view, setView] = useState<ViewId | 'Campaign updates' | 'Reports'>('Discussion');
  const [channel, setChannel] = useState('');
  const [removing, setRemoving] = useState<CommunityPost | null>(null);
  const [reporting, setReporting] = useState<CommunityPost | null>(null);
  const [reason, setReason] = useState('');
  const active = views.find((v) => v.id === view);
  const all = posts.data ?? [];
  const inView = active
    ? all.filter(
        (p) => p.space === active.space && (active.kinds as readonly string[]).includes(p.kind),
      )
    : [];
  // Channels are whatever people have actually used, not a fixed list an admin has to curate.
  const channels = [...new Set(inView.map((p) => p.channel).filter(Boolean))];
  const shown = (channel ? inView.filter((p) => p.channel === channel) : inView).sort((a, b) =>
    active?.id === 'Calendar'
      ? Date.parse(a.eventAt ?? a.date) - Date.parse(b.eventAt ?? b.date)
      : Date.parse(b.date) - Date.parse(a.date),
  );
  const canPost = joined && (moderates || active?.space === 'discussion');
  return (
    <Panel>
      <Text style={styles.h2}>Working together</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { flexWrap: 'nowrap', gap: 8 }]}
      >
        {views
          .filter((v) => !v.moderatorOnly || moderates)
          .map((v) => (
            <Chip
              key={v.id}
              label={v.id}
              selected={view === v.id}
              onPress={() => {
                setView(v.id);
                setChannel('');
              }}
            />
          ))}
        <Chip
          label="Campaign updates"
          selected={view === 'Campaign updates'}
          onPress={() => setView('Campaign updates')}
        />
        {moderates && (
          <Chip label="Reports" selected={view === 'Reports'} onPress={() => setView('Reports')} />
        )}
      </ScrollView>
      <Text style={styles.small}>{blurbs[view]}</Text>
      {view === 'Campaign updates' ? (
        <CampaignUpdates petitions={petitions} />
      ) : view === 'Reports' ? (
        <Reports community={community} />
      ) : (
        <>
          {channels.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.row, { flexWrap: 'nowrap', gap: 8 }]}
            >
              <Chip label="All channels" selected={!channel} onPress={() => setChannel('')} />
              {channels.map((c) => (
                <Chip
                  key={c}
                  label={`#${c}`}
                  selected={channel === c}
                  onPress={() => setChannel(c)}
                />
              ))}
            </ScrollView>
          )}
          {posts.isPending ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : posts.error ? (
            <Notice error text={posts.error.message} />
          ) : shown.length ? (
            shown.map((p) => (
              <Post
                key={p.id}
                post={p}
                community={community}
                profile={profile}
                joined={joined}
                moderates={moderates}
                onRemove={setRemoving}
                onReport={(post) => {
                  setReason('');
                  setReporting(post);
                }}
              />
            ))
          ) : (
            <Text style={styles.muted}>Nothing here yet. Be the first.</Text>
          )}
          {canPost && active && (
            // Keyed by view: the composer picks its default kind from the view it belongs to, so
            // switching from Discussion to Polls has to give it a fresh state.
            <Composer key={active.id} community={community} view={active} channel={channel} />
          )}
          {joined && !canPost && (
            <Notice text="Only this community’s owner and moderators post here." />
          )}
          {!joined && <Notice text="Join this community to take part." />}
        </>
      )}
      <Confirm
        visible={removing !== null}
        title="Remove this post?"
        body="The post is replaced with a visible note saying it was removed, so the conversation stays honest. This cannot be undone."
        pending={m.isPending}
        onCancel={() => setRemoving(null)}
        onConfirm={() =>
          removing &&
          m.mutate(
            {
              type: 'removeEntry',
              scope: 'communityPost',
              entryId: removing.id,
              communityId: community.id,
            },
            { onSuccess: () => setRemoving(null) },
          )
        }
      >
        {m.error && <Notice error text={m.error.message} />}
      </Confirm>
      <Confirm
        visible={reporting !== null}
        title="Report this post?"
        body="This community’s owner and moderators will read your reason. Your name is not shown to them."
        pending={m.isPending}
        onCancel={() => setReporting(null)}
        onConfirm={() =>
          reporting &&
          m.mutate(
            {
              type: 'reportPost',
              communityId: community.id,
              postId: reporting.id,
              reason,
            },
            { onSuccess: () => setReporting(null) },
          )
        }
      >
        <Field
          label="What is wrong with this post?"
          multiline
          value={reason}
          onChangeText={setReason}
        />
        {m.error && <Notice error text={m.error.message} />}
      </Confirm>
      <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.outline }}>
        Fictional demo community. Posts, events, documents and tallies are sample data and carry no
        official weight.
      </Text>
    </Panel>
  );
}
