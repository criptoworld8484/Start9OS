import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.1.4:2',
  releaseNotes: {
    en_US:
      'Fixes the Auto-Configure prompt reappearing on nodes that prune: Fulcrum now accepts pruned Bitcoin nodes, fetching old blocks through the RPC proxy when needed, so the prompt stays quiet as long as ZMQ is enabled. Full archival (pruning disabled, txindex enabled) remains the recommended setup for the fastest lookups.',
    es_ES:
      'Corrige la reaparición del aviso Auto-Configure en nodos con poda: Fulcrum acepta ahora nodos Bitcoin podados, obteniendo los bloques antiguos a través del proxy RPC cuando hace falta, por lo que el aviso permanece en silencio mientras ZMQ esté habilitado. El modo archival completo (poda deshabilitada, txindex habilitado) sigue siendo la configuración recomendada para las consultas más rápidas.',
    de_DE:
      'Behebt das erneute Erscheinen der Auto-Configure-Meldung auf Knoten mit Beschneidung: Fulcrum akzeptiert jetzt beschnittene Bitcoin-Knoten und holt alte Blöcke bei Bedarf über den RPC-Proxy, sodass die Meldung ruhig bleibt, solange ZMQ aktiviert ist. Das vollständige Archiv (Beschneidung deaktiviert, txindex aktiviert) bleibt die empfohlene Einrichtung für die schnellsten Abfragen.',
    pl_PL:
      'Naprawia ponowne pojawianie się monitu Auto-Configure na węzłach z przycinaniem: Fulcrum akceptuje teraz przycinane węzły Bitcoin, pobierając stare bloki przez proxy RPC w razie potrzeby, więc monit pozostaje nieaktywny, o ile ZMQ jest włączone. Pełne archiwum (przycinanie wyłączone, txindex włączone) pozostaje zalecaną konfiguracją dla najszybszych zapytań.',
    fr_FR:
      "Corrige la réapparition de l'invite Auto-Configure sur les nœuds élagués : Fulcrum accepte désormais les nœuds Bitcoin élagués et récupère les anciens blocs via le proxy RPC si nécessaire, de sorte que l'invite reste silencieuse tant que ZMQ est activé. L'archive complète (élagage désactivé, txindex activé) reste la configuration recommandée pour les recherches les plus rapides.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
