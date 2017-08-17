const VERSION = 2
const APISERVER = 'https://api.panlex.org'
const URLBASE = (VERSION === 2) ? APISERVER + '/v2' : APISERVER

export function query(ep, params) {
  let url = URLBASE + ep
  return(fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  .then((response) => response.json()));
}

export function getTranslations(txt, uidDe, uidAl, distance = 0) {
  let queryOne = {
    trans_uid: uidDe,
    uid: uidAl,
    trans_txt: txt,
    include: ['trans_quality', 'trans_txt'],
    sort: 'trans_quality desc',
  };
  let queryTwo = Object.assign({trans_distance: 2}, queryOne);
  return(query('/fallback', {requests: [
    {url: '/expr', query: queryOne},
    {url: '/expr', query: queryTwo},
  ]}).then(responseData => responseData.result))
}