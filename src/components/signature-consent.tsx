import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useBackend, useCommand } from '../data/provider';
import { Petition, Snapshot, Identity, identityLabels } from '../domain/model';
import { CheckRow, OptionRow, SummaryRows } from './design-system';
import { signingError } from '../domain/rules';
import { Signatory, EncryptedVault } from '../domain/signatory';
import { SignatureReceipt, petitionDisclosure } from '../domain/signature-record';
import { decryptSignatory, encryptReceipt } from '../security/signature-vault';
import { SignaturePad } from './signature-pad';
import { Button, Chip, Confirm, Field, Notice, Panel, colors, fonts, styles, tokens } from './ui';

export function SignatureConsent({
  petition,
  snapshot,
  onCancel,
  onRecorded,
}: {
  petition: Petition;
  snapshot: Snapshot;
  onCancel: () => void;
  onRecorded: () => void;
}) {
  const { adapter } = useBackend();
  const command = useCommand();
  // Keep the text that was opened, even when background queries refresh the petition.
  const [disclosure] = useState(() => petitionDisclosure(petition));
  const [identity, setIdentity] = useState<Identity>(
    petition.identities.includes('anonymous') ? 'anonymous' : petition.identities[0],
  );
  const [envelope, setEnvelope] = useState<EncryptedVault | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [key, setKey] = useState('');
  const [signatory, setSignatory] = useState<Signatory | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const epoch = useRef(0);
  const lock = useCallback(() => {
    epoch.current += 1;
    setKey('');
    setSignatory(null);
    setConsent(false);
  }, []);
  useFocusEffect(useCallback(() => () => lock(), [lock]));
  useEffect(() => {
    let active = true;
    void adapter
      .vault()
      .then((value) => {
        if (active) {
          setEnvelope(value);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setError('Could not load your vault. Close and reopen this form to retry.');
      });
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') lock();
    });
    return () => {
      active = false;
      epoch.current += 1;
      listener.remove();
    };
  }, [adapter, lock]);
  useEffect(() => {
    if (!key && !signatory) return;
    const timer = setTimeout(lock, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [key, signatory, lock]);
  const eligible = signingError(petition, snapshot, identity);
  async function unlock() {
    if (!envelope || !snapshot.profile) return;
    const operation = epoch.current;
    setBusy(true);
    setError('');
    try {
      const value = await decryptSignatory(snapshot.profile.id, key, envelope);
      if (operation === epoch.current) setSignatory(value);
    } catch (e) {
      if (operation === epoch.current)
        setError(e instanceof Error ? e.message : 'Could not unlock your vault.');
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setError('');
    if (eligible) {
      setError(eligible);
      return;
    }
    if (!signatory || !snapshot.profile || !consent) {
      setError(
        'Unlock your signature profile, review the full text, and confirm your details before signing.',
      );
      return;
    }
    const operation = epoch.current;
    setBusy(true);
    try {
      const encrypted = await encryptReceipt(snapshot.profile.id, key, {
        disclosure,
        signatory,
        confirmedAt: new Date().toISOString(),
      });
      if (operation !== epoch.current) return;
      // The recovery key and decrypted profile never enter the mutation cache or server request.
      await command.mutateAsync({
        type: 'sign',
        petitionId: petition.id,
        identity,
        submission: { disclosure, envelope: encrypted, consent: true },
      });
      lock();
      onRecorded();
    } catch (e) {
      if (operation === epoch.current)
        setError(
          e instanceof Error
            ? e.message
            : 'Your signature could not be recorded. Please try again.',
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Confirm
      visible
      title="Review and sign"
      body="Read the complete text before giving consent. Your private signature record is encrypted separately from your public display name."
      pending={busy || command.isPending}
      onCancel={() => {
        lock();
        onCancel();
      }}
      onConfirm={() => {
        void submit();
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.canvas,
          borderRadius: tokens.radius,
          padding: 18,
          gap: 12,
        }}
      >
        <Text style={styles.label}>OFFICIAL PETITION TEXT · CREATOR SUPPLIED · FICTIONAL</Text>
        <Text style={[styles.h3, { fontFamily: fonts.heading }]}>{disclosure.title}</Text>
        <Text style={[styles.body, { fontSize: 14, lineHeight: 23 }]}>{disclosure.fullText}</Text>
      </View>
      <SummaryRows
        rows={[
          { label: 'Addressed to', value: disclosure.recipient },
          { label: 'Location', value: disclosure.approximateLocation },
          { label: 'Deadline', value: disclosure.deadline },
        ]}
      />
      <Text style={styles.micro}>
        Your signature is recorded against this exact wording. If the organizer revises the request
        later, your signature stays attached to the text you read here.
      </Text>
      <Notice text="This records support for review. It does not certify a voter-registration match, witness affidavit, official measure text, or legal qualification. Those require the responsible authority’s process." />
      {eligible && <Notice error text={eligible} />}
      {loaded && !envelope && (
        <>
          <Notice text="Set up your private signature vault in Profile first, then return to this petition. Your printed name, registered residence and handwritten signature are required." />
          <Button
            title="Set up my signature profile"
            onPress={() => {
              lock();
              onCancel();
              router.push('/(tabs)/profile');
            }}
          />
        </>
      )}
      {!!envelope && !signatory && (
        <>
          <Field
            label="Vault recovery key"
            value={key}
            onChangeText={setKey}
            secureTextEntry
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Button
            title={busy ? 'Unlocking…' : 'Unlock my signature for review'}
            disabled={busy}
            onPress={() => {
              void unlock();
            }}
          />
        </>
      )}
      {signatory && (
        <>
          <Text style={styles.h3}>Your private signatory record</Text>
          <Text style={styles.body}>
            {signatory.printedName}
            {'\n'}
            {signatory.residenceAddress}
            {'\n'}
            {signatory.jurisdiction}
          </Text>
          <SignaturePad value={signatory.signature} readonly onChange={() => {}} />
          <Text style={styles.muted}>
            Residence is self-attested. To correct these details, cancel and update your signature
            vault in Profile.
          </Text>
          <Button title="Lock private details" variant="ghost" disabled={busy} onPress={lock} />
        </>
      )}
      <Text style={styles.h3}>How should your name appear?</Text>
      <Text style={styles.small}>
        Your account always owns the signature privately. This only changes the public supporter
        list.
      </Text>
      {petition.identities.map((i) => (
        <OptionRow
          key={i}
          label={identityLabels[i]}
          note={identityNotes[i]}
          selected={identity === i}
          onPress={() => setIdentity(i)}
        />
      ))}
      <CheckRow
        label="I read the full text, confirm these are my own current details, and consent to this signature."
        checked={consent}
        onPress={() => setConsent(!consent)}
      />
      <Text style={styles.micro}>
        This fictional signature is not legally valid and is not filed with any government.
      </Text>
      {!!error && <Notice error text={error} />}
    </Confirm>
  );
}

/** What each public identity mode actually shows, in the words a signer needs at the moment. */
const identityNotes: Record<Identity, string> = {
  full_name:
    'Your full profile name appears on the public supporter list and in any packet the organizer delivers.',
  first_name_last_initial:
    'Shown as your first name and last initial, for example “Maya C.”, everywhere the supporter list appears.',
  anonymous:
    'Counted publicly as an anonymous supporter and never named. Your account still owns the signature privately, so you can withdraw it.',
};

export function PrivateSignatureReceipt({ petitionId }: { petitionId: string }) {
  const { adapter } = useBackend();
  const [receipt, setReceipt] = useState<SignatureReceipt | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let active = true;
    void adapter
      .receipt(petitionId)
      .then((value) => {
        if (active) {
          setReceipt(value);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setError('Unable to load your receipt. Reopen this petition to retry.');
      });
    return () => {
      active = false;
    };
  }, [adapter, petitionId]);
  return (
    <Panel>
      <Text style={styles.h3}>Your private signature receipt</Text>
      {receipt && (
        <>
          <Chip
            label={
              receipt.status === 'accepted'
                ? 'ACCEPTED FOR QUALIFICATION'
                : receipt.status === 'rejected'
                  ? 'REVIEWED · NOT ACCEPTED'
                  : 'RECORDED · PENDING LEGAL REVIEW'
            }
          />
          <Text style={styles.muted}>
            Recorded {new Date(receipt.submittedAt).toLocaleString()}. Your encrypted signatory
            details are stored with this exact text. Updating or deleting your profile vault does
            not rewrite this receipt.
          </Text>
          {!!receipt.reviewNote && <Notice text={receipt.reviewNote} />}
          <Button
            title={expanded ? 'Hide the text I signed' : 'View the text I signed'}
            variant="secondary"
            onPress={() => setExpanded(!expanded)}
          />
          {expanded && (
            <>
              <Text style={styles.h3}>{receipt.disclosure.title}</Text>
              <Text style={styles.body}>{receipt.disclosure.fullText}</Text>
              <Text style={styles.muted}>
                To: {receipt.disclosure.recipient}
                {'\n'}Location: {receipt.disclosure.approximateLocation}
              </Text>
            </>
          )}
        </>
      )}
      {loaded && !receipt && (
        <Notice text="This older support record has no encrypted signatory receipt and is not counted as accepted for legal qualification." />
      )}
      {!loaded && !error && <Text style={styles.muted}>Loading your receipt…</Text>}
      {!!error && <Notice error text={error} />}
    </Panel>
  );
}
