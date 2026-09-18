import { LocalAdapter, Storage } from '../src/data/local';
import { demoIds } from '../src/data/seed';
import type { Command } from '../src/domain/model';

type PostCommand = Extract<Command, { type: 'communityPost' }>;

function setup() {
  const values = new Map<string, string>();
  const storage: Storage = {
    getItem: async (k) => values.get(k) ?? null,
    setItem: async (k, v) => {
      values.set(k, v);
    },
  };
  let id = 0;
  return new LocalAdapter(storage, () => `test-${++id}`);
}
/** Jordan owns a community; Sam is a plain member of it. */
async function community(a: LocalAdapter) {
  await a.signIn(demoIds.jordan);
  const id = await a.execute({
    type: 'createCommunity',
    name: 'Riverton working group',
    description: 'A fictional community used to exercise the collaboration spaces.',
    city: 'Riverton, CA',
    topic: 'Safer streets',
  });
  if (typeof id !== 'string') throw new Error('Missing id');
  await a.signIn(demoIds.sam);
  await a.execute({ type: 'join', communityId: id });
  return id;
}
const post = (
  communityId: string,
  extra: Pick<PostCommand, 'body' | 'kind'> & Partial<PostCommand>,
): PostCommand => ({
  type: 'communityPost',
  communityId,
  space: 'discussion',
  channel: '',
  ...extra,
});

test('members post to discussion; only moderators speak for the community', async () => {
  const a = setup();
  const id = await community(a);
  await a.execute(
    post(id, { body: 'A question from a member of the community.', kind: 'question' }),
  );
  await expect(
    a.execute(
      post(id, {
        body: 'A member trying to announce something.',
        kind: 'announcement',
        space: 'announcements',
      }),
    ),
  ).rejects.toThrow(/owner and its moderators/);
  await a.signIn(demoIds.jordan);
  await a.execute(
    post(id, {
      body: 'An announcement in the community voice.',
      kind: 'announcement',
      space: 'announcements',
    }),
  );
  const posts = await a.communityPosts(id);
  expect(posts.map((p) => p.space)).toEqual(['discussion', 'announcements']);
});

test('the organizer space is private to the owner and moderators', async () => {
  const a = setup();
  const id = await community(a);
  await a.signIn(demoIds.jordan);
  await a.execute(post(id, { body: 'Private planning note.', kind: 'idea', space: 'organizers' }));
  expect(await a.communityPosts(id)).toHaveLength(1);
  await a.signIn(demoIds.sam);
  expect(await a.communityPosts(id)).toHaveLength(0);
  // Promotion opens the door; nothing else changes.
  await a.signIn(demoIds.jordan);
  await a.execute({ type: 'moderator', communityId: id, profileId: demoIds.sam, grant: true });
  await a.signIn(demoIds.sam);
  expect(await a.communityPosts(id)).toHaveLength(1);
});

test('a poll publishes counts but never who chose what', async () => {
  const a = setup();
  const id = await community(a);
  await a.signIn(demoIds.jordan);
  await a.execute(
    post(id, {
      body: 'When should we walk the route?',
      kind: 'poll',
      options: ['Weeknight', '', 'Weekend morning'],
    }),
  );
  const poll = (await a.communityPosts(id))[0];
  expect(poll.options).toEqual(['Weeknight', 'Weekend morning']);
  await a.signIn(demoIds.sam);
  await a.execute({
    type: 'communityInteract',
    communityId: id,
    postId: poll.id,
    action: 'vote',
    option: 'Weeknight',
  });
  let seen = (await a.communityPosts(id))[0];
  expect(seen.votes).toEqual({ Weeknight: 1, 'Weekend morning': 0 });
  expect(seen.myVote).toBe('Weeknight');
  // Changing your mind moves the count rather than adding one.
  await a.execute({
    type: 'communityInteract',
    communityId: id,
    postId: poll.id,
    action: 'vote',
    option: 'Weekend morning',
  });
  seen = (await a.communityPosts(id))[0];
  expect(seen.votes).toEqual({ Weeknight: 0, 'Weekend morning': 1 });
  await a.signIn(demoIds.jordan);
  seen = (await a.communityPosts(id))[0];
  expect(seen.votes?.['Weekend morning']).toBe(1);
  expect(seen.myVote).toBeUndefined();
  expect(JSON.stringify(seen)).not.toContain(demoIds.sam);
});

test('a poll needs two to six distinct choices', async () => {
  const a = setup();
  const id = await community(a);
  await expect(
    a.execute(post(id, { body: 'A poll with one choice.', kind: 'poll', options: ['Only'] })),
  ).rejects.toThrow(/2 to 6 choices/);
  await expect(
    a.execute(post(id, { body: 'A poll with a repeat.', kind: 'poll', options: ['Same', 'Same'] })),
  ).rejects.toThrow(/must differ/);
});

test('a task can be claimed, released and completed by whoever holds it', async () => {
  const a = setup();
  const id = await community(a);
  await a.execute(post(id, { body: 'Photograph the unlit stretch.', kind: 'task' }));
  const task = (await a.communityPosts(id))[0];
  expect(task.taskStatus).toBe('open');
  await a.execute({ type: 'communityInteract', communityId: id, postId: task.id, action: 'claim' });
  expect((await a.communityPosts(id))[0].claimedName).toBe('Sam Rivera');
  await expect(
    a.execute({ type: 'communityInteract', communityId: id, postId: task.id, action: 'claim' }),
  ).rejects.toThrow(/already on this task/);
  await a.execute({
    type: 'communityInteract',
    communityId: id,
    postId: task.id,
    action: 'release',
  });
  expect((await a.communityPosts(id))[0].taskStatus).toBe('open');
  await a.execute({ type: 'communityInteract', communityId: id, postId: task.id, action: 'claim' });
  await a.execute({
    type: 'communityInteract',
    communityId: id,
    postId: task.id,
    action: 'complete',
  });
  expect((await a.communityPosts(id))[0].taskStatus).toBe('done');
});

test('a proposal tallies reversible positions', async () => {
  const a = setup();
  const id = await community(a);
  await a.execute(
    post(id, { body: 'Propose asking for a lighting assessment.', kind: 'proposal' }),
  );
  const proposal = (await a.communityPosts(id))[0];
  const act = (action: 'support' | 'oppose' | 'withdraw') =>
    a.execute({ type: 'communityInteract', communityId: id, postId: proposal.id, action });
  await act('support');
  expect((await a.communityPosts(id))[0].support).toBe(1);
  await act('oppose');
  expect((await a.communityPosts(id))[0]).toMatchObject({ support: 0, oppose: 1 });
  await act('withdraw');
  expect((await a.communityPosts(id))[0]).toMatchObject({ support: 0, oppose: 0 });
  await expect(act('withdraw')).rejects.toThrow(/not taken a position/);
});

test('events need a date and documents need an https link', async () => {
  const a = setup();
  const id = await community(a);
  await expect(
    a.execute(post(id, { body: 'An event with no date at all.', kind: 'event' })),
  ).rejects.toThrow(/date/);
  await expect(
    a.execute(
      post(id, {
        body: 'A document with an insecure link.',
        kind: 'document',
        url: 'http://x.org',
      }),
    ),
  ).rejects.toThrow(/https/);
  await a.execute(
    post(id, {
      body: 'A fictional community walk.',
      kind: 'event',
      eventAt: '2026-10-04T18:30',
      location: 'Riverton library',
    }),
  );
  expect((await a.communityPosts(id))[0].location).toBe('Riverton library');
});

test('a report reaches moderators without naming the reporter', async () => {
  const a = setup();
  const id = await community(a);
  await a.signIn(demoIds.jordan);
  await a.execute(post(id, { body: 'A post someone takes issue with.', kind: 'idea' }));
  const target = (await a.communityPosts(id))[0];
  await a.signIn(demoIds.sam);
  await expect(a.communityReports(id)).rejects.toThrow(/owner and its moderators/);
  await a.execute({
    type: 'reportPost',
    communityId: id,
    postId: target.id,
    reason: 'This post names a private individual.',
  });
  await expect(
    a.execute({
      type: 'reportPost',
      communityId: id,
      postId: target.id,
      reason: 'Reporting the very same post twice.',
    }),
  ).rejects.toThrow(/already reported/);
  await a.signIn(demoIds.jordan);
  const queue = await a.communityReports(id);
  expect(queue).toHaveLength(1);
  expect(queue[0].status).toBe('open');
  expect(JSON.stringify(queue)).not.toContain(demoIds.sam);
  await a.execute({
    type: 'resolvePostReport',
    communityId: id,
    reportId: queue[0].id,
    action: 'actioned',
  });
  expect((await a.communityReports(id))[0].status).toBe('actioned');
  await expect(
    a.execute({
      type: 'resolvePostReport',
      communityId: id,
      reportId: queue[0].id,
      action: 'dismissed',
    }),
  ).rejects.toThrow(/already reviewed/);
});

test('a short report reason is refused', async () => {
  const a = setup();
  const id = await community(a);
  await a.execute(post(id, { body: 'A perfectly ordinary post.', kind: 'idea' }));
  const target = (await a.communityPosts(id))[0];
  await expect(
    a.execute({ type: 'reportPost', communityId: id, postId: target.id, reason: 'bad' }),
  ).rejects.toThrow(/at least 10 characters/);
});
