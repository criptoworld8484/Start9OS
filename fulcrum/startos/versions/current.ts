import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.1.4:0',
  releaseNotes: {
    en_US: `Updated Fulcrum to 2.1.4. Address history lookups — used by subscriptions and the blockchain.*.get_history RPCs — are now 5x-10x faster for uncached results, thanks to a new parallel hash-lookup subsystem. The internal servers.json seed list was also refreshed for BCH and BTC. Full release notes: https://github.com/cculianu/Fulcrum/releases/tag/v2.1.4`,
    es_ES: `Fulcrum actualizado a 2.1.4. Las consultas de historial de direcciones —utilizadas por las suscripciones y los RPC blockchain.*.get_history— son ahora entre 5 y 10 veces más rápidas para resultados no cacheados, gracias a un nuevo subsistema de búsqueda paralela de hashes. También se ha actualizado la lista interna de semillas servers.json para BCH y BTC. Notas completas de la versión: https://github.com/cculianu/Fulcrum/releases/tag/v2.1.4`,
    de_DE: `Fulcrum auf 2.1.4 aktualisiert. Adressverlaufsabfragen — verwendet von Abonnements und den blockchain.*.get_history-RPCs — sind dank eines neuen parallelen Hash-Suchsystems nun 5- bis 10-mal schneller für nicht zwischengespeicherte Ergebnisse. Die interne servers.json-SeedList für BCH und BTC wurde ebenfalls aktualisiert. Vollständige Versionshinweise: https://github.com/cculianu/Fulcrum/releases/tag/v2.1.4`,
    pl_PL: `Zaktualizowano Fulcrum do 2.1.4. Zapytania o historię adresów — używane przez subskrypcje i RPC blockchain.*.get_history — są teraz 5–10 razy szybsze dla wyników spoza pamięci podręcznej, dzięki nowemu równoległemu podsystemowi wyszukiwania hashy. Odświeżono też wewnętrzną listę seedów servers.json dla BCH i BTC. Pełne informacje o wydaniu: https://github.com/cculianu/Fulcrum/releases/tag/v2.1.4`,
    fr_FR: `Fulcrum mis à jour vers la version 2.1.4. Les requêtes d'historique d'adresse — utilisées par les abonnements et les RPC blockchain.*.get_history — sont désormais 5 à 10 fois plus rapides pour les résultats non mis en cache, grâce à un nouveau sous-système de recherche parallèle de hachés. La liste interne de seeds servers.json pour BCH et BTC a également été actualisée. Notes de version complètes : https://github.com/cculianu/Fulcrum/releases/tag/v2.1.4`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
