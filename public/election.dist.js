var CAQ = "C.A.Q.-E.F.L.";
var PLQ = "P.L.Q./Q.L.P.";
var PQ = "P.Q.";
var QS = "Q.S.";
var PQ_QS = "Coalition P.Q./Q.S.";
var res = (resultats) => resultats.circonscriptions.map(
  (cr) => cr.candidats.map((cd) => ({
    nom: cd.abreviationPartiPolitique,
    vote: cd.tauxVote
  }))
);
var getBestCandidat = (candidats) => candidats.sort((cd1, cd2) => cd1.vote < cd2.vote ? 1 : -1)[0];
var getBestInEach = (data) => data.map(getBestCandidat);
var compileBests = (bestInCrs) => bestInCrs.reduce((acc, cr) => {
  const newCandidat = acc.find((c) => c.nom == cr.nom);
  newCandidat == void 0 && console.log(acc, cr);
  const otherWinners = acc.filter((c) => c.nom != cr.nom);
  return [...otherWinners, {
    nom: newCandidat.nom,
    vote: newCandidat.vote + 1
  }];
}, [
  { nom: CAQ, vote: 0 },
  { nom: PLQ, vote: 0 },
  { nom: QS, vote: 0 },
  { nom: PQ, vote: 0 }
]);
var getResult = (data) => compileBests(getBestInEach(data));
var modifyResult = (data, turnoverPQversQS, turnoverQSversPQ, turnoverCAQversPQ, turnoverCAQversQS) => data.map((cs) => {
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
var bigWinner = (winners) => {
  const scoreQS = winners.find((w) => w.nom == QS)?.vote ?? 0;
  const scorePQ = winners.find((w) => w.nom == PQ)?.vote ?? 0;
  const scoreCAQ = winners.find((w) => w.nom == CAQ)?.vote ?? 0;
  const scorePLQ = winners.find((w) => w.nom == PLQ)?.vote ?? 0;
  const scorePQ_QS = scoreQS + scorePQ;
  return {
    QS: scoreQS,
    PQ: scorePQ,
    CAQ: scoreCAQ,
    PLQ: scorePLQ,
    PQ_QS: scorePQ_QS
  };
};
var totalCalculation = (r, tpq, tqp, tcp, tcq) => bigWinner(getResult(modifyResult(res(r), tpq, tqp, tcp, tcq)));
var biggestScore = (d) => Object.values(d).sort()[0];
