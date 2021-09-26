
/* globals UMAP ML */

// required for now
// https://github.com/PAIR-code/umap-js/issues/37#issuecomment-614117618
// eslint-disable-next-line no-unused-vars
const window = self;

// eslint-disable-next-line no-undef
importScripts('./umap-js.min.js');

// eslint-disable-next-line no-undef
importScripts('./ml.min.js');

const peopleArrToNetwork = (peopleArr) => {
  const nodes = peopleArr.map((p) => ({
    id: p.displayname,
    group: 1
  }));
  const links = [];
  for(let i=0; i<peopleArr.length-1; i++) {
    for(let j=i+1; j<peopleArr.length; j++) {
      const src = peopleArr[i];
      const trg = peopleArr[j];
      const srcSkills = src.skills;
      const trgSkills = trg.skills;
      const common = srcSkills.filter((skill) => trgSkills.includes(skill));
      if(common.length > 0) {
        links.push({source:src.displayname, target:trg.displayname, value: common.length});
      }
    }
  }

  return {nodes, links};
};

const networkToSkillsMatrix = (network, people) => {
  const N = network.nodes.length;
  const matrix = [];
  const names = network.nodes.map((o) => o.id);
  for(let i=0; i<N; i++) {
    matrix[i] = new Float32Array(N);
    matrix[i][i] = people[i].skills.length;
  }
  for(const e of network.links) {
    const i = names.indexOf(e.source);
    const j = names.indexOf(e.target);
    matrix[i][j] = e.value;
    matrix[j][i] = e.value;
  }

  return matrix;
};

/*
lut(small matrix index) = corresponding large matrix index
*/
const findNullEntriesInMatrix = (m) => {
  const lut = [];
  let j = 0;
  for(let i=0; i<m.length; i++) {
    const sum = m[i].reduce((a, b) => a+b);
    if (sum > 0) {
      lut[j] = i;
      j++;
    }
  }

  return lut;
};

const removeNullEntriesInMatrix = (m, lut) => {
  const res = [];
  for(let i=0; i<lut.length; i++) {
    res.push(m[lut[i]]);
  }

  return res;
};

const normalise = (v) => {
  const n = Math.sqrt(v[0]**2+v[1]**2);

  return [v[0]/n, v[1]/n];
};

// eslint-disable-next-line max-statements
const findPrincipalComponents = (m) => {
  let mx=0,
    my=0;
  let xx = 0,
    xy = 0,
    yy = 0;
  for(let i=0; i<m.length; i++) {
    mx += m[i][0];
    my += m[i][1];
  }
  mx/=m.length;
  my/=m.length;
  for(let i=0; i<m.length; i++) {
    xx += (m[i][0]-mx)**2;
    yy += (m[i][1]-my)**2;
    xy += (m[i][0]-mx)*(m[i][1]-my);
  }

  // http://people.math.harvard.edu/~knill/teaching/math21b2004/exhibits/2dmatrices/index.html
  // matrix is [sum(xi^2)  sum(xi*yi)]
  //           [sum(xi*yi) sum(yi^2)]
  const t = (xx+yy)/2;
  const d = xx*yy - xy**2;
  const k = Math.sqrt(t**2-d);
  const l1 = t+k;
  const l2 = t-k;
  let e1, e2;
  if(l1>l2) {
    e1 = normalise([xy, l1-xx]);
    e2 = normalise([xy, l2-xx]);
  } else {
    e1 = normalise([xy, l2-xx]);
    e2 = normalise([xy, l1-xx]);
  }

  return {mean: [mx, my], evec1: e1, evec2: e2};
};

// eslint-disable-next-line max-statements
const pruneSkillsMatrixBasedOnEmbeddingNearestNeighbours = (matrix, embedding) => {
  const kNN = 8;
  const N = matrix.length;
  const dist = [];
  for(let i=0; i<N; i++) {
    dist[i] = new Float32Array(N);
  }
  for(let i=0; i<N; i++) {
    for(let j=i; j<N; j++) {
      let d = 0;
      for(let k=0; k<embedding[0].length; k++) {
        d += (embedding[i][k]-embedding[j][k])**2;
      }
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }
  for(let i=0; i<N; i++) {
    const sorted = [...dist[i]].map((val, ind) => [val, ind]).sort((a, b) => b[0]-a[0]);
    for(let j=0; j<N-kNN; j++) {
      const [, ind] = sorted[j];
      matrix[i][ind] = 0;
    }
  }
};

const skillsMatrixClustersToGroups = (matrix, network) => {
  const {agnes} = ML.HClust;
  const tree = agnes(matrix, {
    method: 'ward'
  });
  const N = matrix.length;
  const ngroups = Math.floor(Math.sqrt(N));
  const groups = tree.group(ngroups);
  for(let i=0; i<groups.children.length; i++) {
    if(groups.children[i].constructor.name === "ClusterLeaf") {
      network.nodes[groups.children[i].index].group = 0;
    } else {
      for(const p of groups.children[i].index) {
        network.nodes[p.index].group = i;
      }
    }
  }
};

const matrixToNetwork = (matrix, embedding, width, height, Z, names, loggedUser) => {
  const nodes = [];
  const links = [];
  const N = matrix.length;
  for(let i=0; i<N; i++) {
    nodes[i] = {
      id: names[i],
      x: width/2+Z*embedding[i][0],
      y: height/2+Z*embedding[i][1],
      vx: 0,
      vy: 0
    };

    if(loggedUser === names[i]) {
      nodes[i].classes = "logged";
    }

    for(let j=0; j<N; j++) {
      if(i!==j && matrix[i][j]>0) {
        links.push({
          source: names[i],
          target: names[j],
          value: matrix[i][j]});
      }
    }
  }

  return {nodes, links};
};

// eslint-disable-next-line max-statements
const addBrainWebToElementWorkerFn = (people, userDisplayName, width, height) => {
  const names = people.map((o) => o.displayname);
  const radius = 5;
  const maj = width/height;

  const fullNetwork = peopleArrToNetwork(people);
  const matrix = networkToSkillsMatrix(fullNetwork, people);

  // remove null entries from matrix
  const lut = findNullEntriesInMatrix(matrix);
  const matrix2 = removeNullEntriesInMatrix(matrix, lut);

  // add background link
  const N = matrix2.length;
  for(let i=0; i<N; i++) {
    for(let j=i; j<N; j++) {
      matrix2[i][j] += 0.5;
    }
  }

  // 2d embedding for display
  const umap2 = new UMAP({
    minDist: 0.2
  });
  const embedding = umap2.fit(matrix2);

  // align embedding axes
  const {mean, evec1, evec2} = findPrincipalComponents(embedding);
  let [minX, maxX, minY, maxY] = [0, 0, 0, 0];
  for(let i=0; i<embedding.length; i++) {
    let [x, y] = embedding[i];
    x -= mean[0];
    y -= mean[1];
    embedding[i][0] = x*evec1[0] + y*evec1[1];
    embedding[i][1] = x*evec2[0] + y*evec2[1];
  }

  // find embedding size
  for(let i=0; i<embedding.length; i++) {
    minX = Math.min(minX, embedding[i][0]);
    maxX = Math.max(maxX, embedding[i][0]);
    minY = Math.min(minY, embedding[i][1]);
    maxY = Math.max(maxY, embedding[i][1]);
  }
  const Z = 0.95 * Math.min(width/(maxX-minX), height/(maxY-minY));

  // center embedding
  for(let i=0; i<embedding.length; i++) {
    embedding[i][0] -= (minX + maxX)/2;
    embedding[i][1] -= (minY + maxY)/2;
  }

  // 5d embedding for clustering
  const umap5 = new UMAP({
    nComponents:5,
    nNeighbors: 10
  });
  const embedding5 = umap5.fit(matrix2);
  pruneSkillsMatrixBasedOnEmbeddingNearestNeighbours(matrix2, embedding5);

  // add null entries back
  const finalMatrix = JSON.parse(JSON.stringify(matrix));
  const finalEmbedding = [];
  let j=0;
  const R = 0.9*width/Z/2;
  for(let i=0; i<matrix.length; i++) {
    if(lut.indexOf(i)<0) {
      const theta = 2*Math.PI*j/(matrix.length-lut.length);
      finalEmbedding[i] = [R*Math.cos(theta), (R/maj)*Math.sin(theta)];
      j++;
    }
    for(let k=0; k<matrix.length; k++) {
      finalMatrix[i][k]=0;
    }
  }
  for(let i=0; i<lut.length; i++) {
    finalEmbedding[lut[i]] = embedding[i];
    for(let k=0; k<lut.length; k++) {
      finalMatrix[lut[i]][lut[k]] = matrix2[i][k];
    }
  }

  // build network
  const prunedNetwork = matrixToNetwork(finalMatrix, finalEmbedding, width, height, Z, names, userDisplayName);

  // cluster groups
  skillsMatrixClustersToGroups(matrix, prunedNetwork);

  return {prunedNetwork, radius};
};

self.onmessage = (message) => {
  if (message.data.method === 'addBrainWebToElement') {
    const { id, param } = message.data;
    const { people, userDisplayName, width, height } = param;
    try {
      const result = addBrainWebToElementWorkerFn(people, userDisplayName, width, height);
      postMessage({id, result});
    } catch (error) {
      postMessage({id, error});
    }
  }
};
