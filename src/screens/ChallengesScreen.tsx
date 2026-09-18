import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import ProgressBar from '../ui/ProgressBar';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { getErrorMessage } from '../api/errors';
import challengesApi, { Challenge, ChallengeParticipation } from '../api/challenges';

interface ChallengeRow {
  challenge: Challenge;
  participation: ChallengeParticipation | null;
}

export default function ChallengesScreen() {
  const { colors } = useTheme();
  const { showToast, refreshDashboard } = useAppState();
  const [rows, setRows] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [available, mine] = await Promise.all([
        challengesApi.getAvailable(),
        challengesApi.getMine(),
      ]);
      const participationByChallenge = new Map(
        mine.participations
          .filter((p) => p.status !== 'ABANDONED')
          .map((p) => [p.challenge_id, p])
      );
      setRows(
        available.map((challenge) => ({
          challenge,
          participation: participationByChallenge.get(challenge.id) ?? null,
        }))
      );
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = async (challengeId: string) => {
    setBusyId(challengeId);
    try {
      await challengesApi.join(challengeId);
      showToast('✨ Desafio iniciado! Uma missão foi gerada para você.');
      // A missão gerada pro desafio precisa aparecer na aba Missions sem precisar reabrir o
      // app — sem isso, o AppStateContext só teria essa missão na próxima vez que buscasse o
      // bootstrap inteiro.
      await Promise.all([load(), refreshDashboard()]);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleAbandon = async (challengeId: string) => {
    setBusyId(challengeId);
    try {
      await challengesApi.abandon(challengeId);
      showToast('Desafio abandonado.');
      await load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title="CHALLENGES" />}>
      {loading ? (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : rows.length === 0 ? (
        <View style={{ paddingVertical: 60, alignItems: 'center', gap: 8 }}>
          <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
            Nenhum desafio disponível pro seu rank ainda.
          </RajdhaniText>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {rows.map(({ challenge, participation }) => {
            const joined = participation?.status === 'ACTIVE';
            const completed = participation?.status === 'COMPLETED';
            const progress = participation?.progress ?? 0;
            const target = challenge.target_count;
            const percent = Math.min(100, Math.round((progress / target) * 100));
            const busy = busyId === challenge.id;

            return (
              <View
                key={challenge.id}
                style={{
                  backgroundColor: colors.bg1,
                  borderWidth: 1,
                  borderColor: completed ? 'rgba(34,197,94,.4)' : colors.border,
                  borderRadius: 12,
                  padding: 16,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <RajdhaniText weight="700" style={{ flex: 1, fontSize: 15, color: colors.text }}>
                    {challenge.title}
                  </RajdhaniText>
                  <RajdhaniText weight="700" style={{ fontSize: 11, color: '#FBBF24' }}>
                    +{challenge.xp_base} XP
                  </RajdhaniText>
                </View>
                <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>{challenge.description}</RajdhaniText>

                {(joined || completed) && (
                  <>
                    <ProgressBar percent={completed ? 100 : percent} colors={completed ? ['#22C55E', '#22C55E'] : ['#7C3AED', '#FBBF24']} animated={false} />
                    <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>
                      {completed ? `Concluído — ${target}/${target} missões` : `${progress}/${target} missões concluídas`}
                    </RajdhaniText>
                  </>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  {completed ? (
                    <View
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(34,197,94,.4)',
                        backgroundColor: 'rgba(34,197,94,.1)',
                      }}
                    >
                      <OrbitronText weight="800" style={{ fontSize: 10, color: '#22C55E' }}>✓ CONCLUÍDO</OrbitronText>
                    </View>
                  ) : (
                    <PressableScale
                      onPress={() => (joined ? handleAbandon(challenge.id) : handleJoin(challenge.id))}
                      disabled={busy}
                      scaleTo={0.95}
                      style={{
                        minHeight: 32,
                        justifyContent: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: joined ? 'rgba(239,68,68,.35)' : 'rgba(0,245,255,.35)',
                        backgroundColor: joined ? 'rgba(239,68,68,.1)' : 'rgba(0,245,255,.12)',
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      {busy ? (
                        <ActivityIndicator size="small" color={joined ? '#EF4444' : '#00F5FF'} />
                      ) : (
                        <OrbitronText weight="800" style={{ fontSize: 10, color: joined ? '#EF4444' : '#00F5FF' }}>
                          {joined ? 'ABANDONAR' : 'ENTRAR'}
                        </OrbitronText>
                      )}
                    </PressableScale>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
