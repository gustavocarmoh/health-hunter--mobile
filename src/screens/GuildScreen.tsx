import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import ProgressBar from '../ui/ProgressBar';
import StatTriple from '../ui/StatTriple';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { fmtXp } from '../state/selectors';
import { GUILD_ROLE_CONFIG } from '../state/stateConfig';
import { RootStackParamList } from '../navigation/types';
import { getErrorMessage } from '../api/errors';
import guildsApi, { GuildInvite, GuildMonster, GuildRole } from '../api/guilds';
import huntersApi, { HunterSearchResult } from '../api/hunters';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PROMOTABLE_ROLES: Exclude<GuildRole, 'MASTER'>[] = ['VICE_MASTER', 'ELITE', 'MEMBER'];

export default function GuildScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user, guild, guildMembers, leaveGuild, refreshDashboard, showToast } = useAppState();
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [monster, setMonster] = useState<GuildMonster | null>(null);
  const [monsterLoading, setMonsterLoading] = useState(true);
  const [showMonsterInfo, setShowMonsterInfo] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [busyMember, setBusyMember] = useState<string | null>(null);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<HunterSearchResult[]>([]);
  const [inviteSearching, setInviteSearching] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const [pendingInvites, setPendingInvites] = useState<GuildInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  const hasGuild = !!guild.id;
  const canManage = guild.myRole === 'MASTER' || guild.myRole === 'VICE_MASTER';
  const isMaster = guild.myRole === 'MASTER';

  useEffect(() => {
    if (!hasGuild) return;
    let mounted = true;
    guildsApi
      .getMonster()
      .then((m) => mounted && setMonster(m))
      .catch(() => mounted && setMonster(null))
      .finally(() => mounted && setMonsterLoading(false));
    return () => {
      mounted = false;
    };
  }, [hasGuild]);

  const loadPendingInvites = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const invites = await guildsApi.getInvites();
      setPendingInvites(invites);
    } catch {
      setPendingInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasGuild) loadPendingInvites();
  }, [hasGuild, loadPendingInvites]);

  const onConfirmLeave = () => {
    setConfirmingLeave(false);
    leaveGuild();
    navigation.navigate('GuildBrowse');
  };

  const onRespondInvite = async (inviteId: string, accept: boolean) => {
    try {
      await guildsApi.respondToInvite(inviteId, accept);
      showToast(accept ? '✨ Entrou na guilda!' : 'Convite recusado.');
      await refreshDashboard();
      await loadPendingInvites();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const runInviteSearch = async (query: string) => {
    setInviteQuery(query);
    if (query.trim().length < 2) {
      setInviteResults([]);
      return;
    }
    setInviteSearching(true);
    try {
      const results = await huntersApi.search(query.trim());
      setInviteResults(results);
    } catch {
      setInviteResults([]);
    } finally {
      setInviteSearching(false);
    }
  };

  const sendInvite = async (targetId: string) => {
    setInvitingId(targetId);
    try {
      await guildsApi.invite(guild.id, targetId);
      showToast('✨ Convite enviado!');
      setInviteResults((prev) => prev.filter((r) => r.id !== targetId));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setInvitingId(null);
    }
  };

  const promoteMember = async (userId: string, role: GuildRole) => {
    setBusyMember(userId);
    try {
      await guildsApi.promote(guild.id, userId, role as Exclude<GuildRole, 'MASTER'>);
      showToast('Papel atualizado.');
      setExpandedMember(null);
      await refreshDashboard();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyMember(null);
    }
  };

  if (!hasGuild) {
    return (
      <ScreenContainer withTabBarPadding={false}>
        <ScreenHeader title="GUILD" />
        <View style={{ alignItems: 'center', paddingVertical: 30, gap: 8, marginBottom: 20 }}>
          <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
            Você ainda não faz parte de nenhuma guilda.
          </RajdhaniText>
        </View>

        {invitesLoading ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : pendingInvites.length > 0 ? (
          <View style={{ gap: 10, marginBottom: 20 }}>
            <OrbitronText weight="700" style={{ fontSize: 11, letterSpacing: 2, color: colors.dim }}>
              CONVITES PENDENTES
            </OrbitronText>
            {pendingInvites.map((inv) => (
              <View
                key={inv.invite_id}
                style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, gap: 8 }}
              >
                <RajdhaniText weight="700" style={{ fontSize: 13, color: colors.text }}>
                  {inv.guild?.name ?? 'Guilda'} [{inv.guild?.tag}]
                </RajdhaniText>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <PressableScale
                    onPress={() => onRespondInvite(inv.invite_id, true)}
                    scaleTo={0.96}
                    style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#7C3AED', alignItems: 'center' }}
                  >
                    <OrbitronText weight="800" style={{ fontSize: 10, color: '#fff' }}>ACEITAR</OrbitronText>
                  </PressableScale>
                  <PressableScale
                    onPress={() => onRespondInvite(inv.invite_id, false)}
                    scaleTo={0.96}
                    style={{ flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,.4)', alignItems: 'center' }}
                  >
                    <OrbitronText weight="800" style={{ fontSize: 10, color: '#EF4444' }}>RECUSAR</OrbitronText>
                  </PressableScale>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <PressableScale
          onPress={() => navigation.navigate('GuildBrowse')}
          scaleTo={0.97}
          style={{ paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg1, alignItems: 'center' }}
        >
          <OrbitronText weight="700" style={{ fontSize: 11, color: colors.text }}>BUSCAR GUILDAS</OrbitronText>
        </PressableScale>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withTabBarPadding={false}>
      <ScreenHeader title="GUILD" />

      <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18, marginBottom: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
            <OrbitronText weight="800" style={{ fontSize: 16, color: '#fff' }}>{guild.tag}</OrbitronText>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <OrbitronText weight="700" numberOfLines={1} style={{ fontSize: 15, color: colors.text }}>{guild.name}</OrbitronText>
            <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>{guildMembers.length} membros · {GUILD_ROLE_CONFIG[guild.myRole].label}</RajdhaniText>
          </View>
          <PressableScale onPress={() => navigation.navigate('GuildRanking')} scaleTo={0.95}>
            <View style={{ backgroundColor: 'rgba(0,245,255,.12)', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10 }}>
              <OrbitronText weight="800" style={{ fontSize: 11, color: '#00F5FF' }}>#{guild.globalRank}</OrbitronText>
            </View>
          </PressableScale>
        </View>
        <StatTriple
          cells={[
            { value: fmtXp(guild.totalXp), label: 'GUILD XP', color: '#FBBF24' },
            { value: guild.contributionRank ? `#${guild.contributionRank}` : '—', label: 'SEU RANK NA GUILDA' },
            { value: fmtXp(guild.weeklyContribution), label: 'SUA CONTRIB.' },
          ]}
        />
      </View>

      <PressableScale
        onPress={() => setShowMonsterInfo((v) => !v)}
        scaleTo={0.98}
        style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: 'rgba(239,68,68,.3)', borderRadius: 14, padding: 16, marginBottom: 20 }}
      >
        {monsterLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <ActivityIndicator size="small" color="#EF4444" />
          </View>
        ) : monster ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <RajdhaniText weight="700" style={{ fontSize: 14, color: colors.text }}>
                {monster.icon} {monster.name}
              </RajdhaniText>
              <RajdhaniText weight="700" style={{ fontSize: 11, color: colors.dim }}>
                {monster.current_hp.toLocaleString()} / {monster.max_hp.toLocaleString()} HP
              </RajdhaniText>
            </View>
            <ProgressBar
              percent={Math.round((monster.current_hp / monster.max_hp) * 100)}
              colors={['#EF4444', '#FBBF24']}
              animated={false}
            />
            {showMonsterInfo && (
              <RajdhaniText style={{ fontSize: 11, color: colors.dim, marginTop: 8 }}>
                Não existe botão de ataque — toda atividade ou missão concluída por qualquer
                membro da guilda causa dano automaticamente. Quando o HP zerar, todo mundo na
                guilda recebe recompensa em XP e moedas, e um novo monstro aparece.
              </RajdhaniText>
            )}
            {!showMonsterInfo && (
              <RajdhaniText style={{ fontSize: 11, color: colors.dim, marginTop: 6 }}>
                Toque para ver como funciona o combate
              </RajdhaniText>
            )}
          </>
        ) : (
          <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>
            Não foi possível carregar o monstro da guilda.
          </RajdhaniText>
        )}
      </PressableScale>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <OrbitronText weight="700" style={{ fontSize: 11, letterSpacing: 2, color: colors.dim }}>MEMBROS</OrbitronText>
        {canManage && (
          <PressableScale
            onPress={() => setInviteModalOpen(true)}
            scaleTo={0.95}
            style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(124,58,237,.4)', backgroundColor: 'rgba(124,58,237,.12)' }}
          >
            <OrbitronText weight="800" style={{ fontSize: 10, color: '#A78BFA' }}>+ CONVIDAR</OrbitronText>
          </PressableScale>
        )}
      </View>
      <View style={{ gap: 8, marginBottom: 20 }}>
        {guildMembers.map((m) => {
          const canPromoteThis = isMaster && !m.isMe && m.role !== 'MASTER';
          const expanded = expandedMember === m.userId;
          return (
            <View key={m.userId} style={{ gap: 6 }}>
              <PressableScale
                onPress={() => canPromoteThis && setExpandedMember(expanded ? null : m.userId)}
                disabled={!canPromoteThis}
                scaleTo={canPromoteThis ? 0.98 : 1}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: m.isMe ? 'rgba(124,58,237,.12)' : colors.bg1,
                  borderWidth: 1,
                  borderColor: m.isMe ? 'rgba(124,58,237,.4)' : colors.border,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: m.avatarColor, alignItems: 'center', justifyContent: 'center' }}>
                  <OrbitronText weight="800" style={{ fontSize: 13, color: '#fff' }}>{m.name[0]?.toUpperCase()}</OrbitronText>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <RajdhaniText weight="600" numberOfLines={1} style={{ fontSize: 13, color: colors.text }}>{m.name}</RajdhaniText>
                  <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>{GUILD_ROLE_CONFIG[m.role].label}</RajdhaniText>
                </View>
                <OrbitronText weight="700" style={{ fontSize: 11, color: '#FBBF24' }}>{fmtXp(m.xp)} XP</OrbitronText>
              </PressableScale>
              {expanded && canPromoteThis && (
                <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 4 }}>
                  {PROMOTABLE_ROLES.filter((r) => r !== m.role).map((r) => (
                    <PressableScale
                      key={r}
                      onPress={() => promoteMember(m.userId, r)}
                      disabled={busyMember === m.userId}
                      scaleTo={0.95}
                      style={{ flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', opacity: busyMember === m.userId ? 0.6 : 1 }}
                    >
                      <OrbitronText weight="700" style={{ fontSize: 9, color: colors.text }}>
                        {GUILD_ROLE_CONFIG[r].label.toUpperCase()}
                      </OrbitronText>
                    </PressableScale>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {!confirmingLeave ? (
          <PressableScale
            onPress={() => setConfirmingLeave(true)}
            scaleTo={0.97}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,.4)', alignItems: 'center' }}
          >
            <OrbitronText weight="700" style={{ fontSize: 11, color: '#EF4444' }}>SAIR DA GUILDA</OrbitronText>
          </PressableScale>
        ) : (
          <PressableScale
            onPress={onConfirmLeave}
            scaleTo={0.97}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' }}
          >
            <OrbitronText weight="700" style={{ fontSize: 11, color: '#fff' }}>CONFIRMAR SAÍDA</OrbitronText>
          </PressableScale>
        )}
      </View>

      <Modal visible={inviteModalOpen} animationType="slide" transparent onRequestClose={() => setInviteModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.bg0, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '75%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <OrbitronText weight="800" style={{ fontSize: 14, color: colors.text }}>CONVIDAR HUNTER</OrbitronText>
              <PressableScale onPress={() => setInviteModalOpen(false)} scaleTo={0.9}>
                <RajdhaniText style={{ fontSize: 20, color: colors.muted }}>✕</RajdhaniText>
              </PressableScale>
            </View>
            <TextInput
              placeholder="Buscar por nome..."
              placeholderTextColor={colors.muted}
              value={inviteQuery}
              onChangeText={runInviteSearch}
              autoFocus
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                marginBottom: 12,
              }}
            />
            {inviteSearching ? (
              <ActivityIndicator size="small" color="#7C3AED" />
            ) : (
              <FlatList
                data={inviteResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <RajdhaniText weight="600" numberOfLines={1} style={{ fontSize: 13, color: colors.text }}>{item.name}</RajdhaniText>
                      <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>Rank {item.rank} · {fmtXp(item.xp)} XP</RajdhaniText>
                    </View>
                    <PressableScale
                      onPress={() => sendInvite(item.id)}
                      disabled={invitingId === item.id}
                      scaleTo={0.95}
                      style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#7C3AED' }}
                    >
                      {invitingId === item.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <OrbitronText weight="800" style={{ fontSize: 10, color: '#fff' }}>CONVIDAR</OrbitronText>
                      )}
                    </PressableScale>
                  </View>
                )}
                ListEmptyComponent={
                  inviteQuery.trim().length >= 2 ? (
                    <RajdhaniText style={{ fontSize: 12, color: colors.muted, textAlign: 'center', paddingVertical: 16 }}>
                      Nenhum hunter encontrado.
                    </RajdhaniText>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
