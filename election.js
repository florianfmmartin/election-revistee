import { resultat } from "./resultats.js";
const CAQ = "C.A.Q.-E.F.L.";
const PLQ = "P.L.Q./Q.L.P.";
const PQ = "P.Q.";
const QS = "Q.S.";
const PQ_QS = "Coalition P.Q./Q.S.";
const res = resultat.circonscriptions.map(
  (cr) => cr.candidats.map((cd) => ({
    nom: cd.abreviationPartiPolitique,
    vote: cd.tauxVote
  }))
);
const getBestCandidat = (candidats) => candidats.sort((cd1, cd2) => cd1.vote < cd2.vote ? 1 : -1)[0];
const getBestInEach = (data) => data.map(getBestCandidat);
const compileBests = (bestInCrs) => Object.entries(
  bestInCrs.reduce((acc, cr) => {
    acc[cr.nom] = !acc[cr.nom] ? 1 : acc[cr.nom] + 1;
    return acc;
  }, {})
);
const getResult = (data) => compileBests(getBestInEach(data));
const modifyResult = (data, turnoverPQversQS, turnoverQSversPQ, turnoverCAQversPQ, turnoverCAQversQS) => data.map((cs) => {
  const votePQ = cs.find((c) => c.nom == PQ)?.vote ?? 0;
  const voteQS = cs.find((c) => c.nom == QS)?.vote ?? 0;
  const voteCAQ = cs.find((c) => c.nom == CAQ)?.vote ?? 0;
  const QSplusHautQuePQ = voteQS > votePQ;
  const votePlusBas = QSplusHautQuePQ ? votePQ : voteQS;
  const turnoverPQ_QS = QSplusHautQuePQ ? turnoverPQversQS : turnoverQSversPQ;
  const ajustementPQ_QS = turnoverPQ_QS / 100 * votePlusBas;
  const turnoverCAQ = QSplusHautQuePQ ? turnoverCAQversQS : turnoverCAQversPQ;
  const ajustementCAQ = turnoverCAQ / 100 * voteCAQ;
  const nouveauVotePQ = QSplusHautQuePQ ? votePQ - ajustementPQ_QS : votePQ + ajustementPQ_QS + ajustementCAQ;
  const nouveauVoteQS = QSplusHautQuePQ ? voteQS + ajustementPQ_QS + ajustementCAQ : voteQS - ajustementPQ_QS;
  const nouveauVoteCAQ = voteCAQ - ajustementCAQ;
  const PLQs = cs.filter((c) => c.nom == PLQ);
  return [
    ...PLQs,
    { nom: QS, vote: nouveauVoteQS },
    { nom: PQ, vote: nouveauVotePQ },
    { nom: CAQ, vote: nouveauVoteCAQ }
  ];
});
const bigWinner = (winners, coalition) => {
  let winnersCalcul = winners;
  const scoreQS = (winners.find((w) => w[0] == QS) ?? [0, 0])[1];
  const scorePQ = (winners.find((w) => w[0] == PQ) ?? [0, 0])[1];
  if (coalition) {
    winnersCalcul = [...winners, [PQ_QS, scorePQ + scoreQS]];
  }
  winnersCalcul.sort(([_, v1], [_n, v2]) => v1 < v2 ? -1 : 1);
  return winnersCalcul[winnersCalcul.length - 1][1];
};
