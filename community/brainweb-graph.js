/* globals d3 */
/* eslint-disable no-invalid-this */

const drag = (simulation) => {
  const dragstarted = (d) => {
    d3.event.sourceEvent.preventDefault();
    if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
    d.fx = d.x;
    d.fy = d.y;
  };
  const dragged = (d) => {
    d3.event.sourceEvent.preventDefault();
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };
  const dragended = (d) => {
    d3.event.sourceEvent.preventDefault();
    if (!d3.event.active) { simulation.alphaTarget(0); }
    d.fx = null;
    d.fy = null;
  };

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

const chart = (data, {width, height, radius, userClickFn}) => {
  const zoom = 1;
  const {nodes, links} = data;

  const simulation = d3.forceSimulation(nodes)
    .velocityDecay(0.1)
    .force(
      "link",
      d3.forceLink(links)
        .id((d) => d.id)
        .distance((link) => {
          const dist = Math.sqrt((link.source.x - link.target.x)**2 + (link.source.y - link.target.y)**2);

          return dist;
        }))
    .force("collision", d3.forceCollide(5));
  window.theSimulation = simulation;

  const mouseover = () => {
    d3.select(this).transition()
      .duration(50)
      .attr("r", radius * zoom * 1.5);
  };

  const mouseout = () => {
    d3.select(this).transition()
      .duration(50)
      .attr("r", radius * zoom);
  };

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "background-color: rgba(0,0,0,0)");
  window.theSVG = svg;

  const link = svg.append("g")
    .attr("stroke", "#faa")
    .attr("stroke-opacity", 0.3)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr('class', 'link')
    .attr("stroke-width", (d) => zoom * d.value**(1/4));

  const node = svg.append("g")
    .selectAll(".node")
    .data(nodes)
    .join("g")
    .attr('class', 'node')
    .call(drag(simulation));

  const scale = d3.scaleOrdinal(d3.schemePaired);
  node.append('circle')
    .attr('class', (d) => d.classes || '')
    .attr("r", radius * zoom)
    .attr("fill", (d) => scale(d.group))
    .on("click", (d) => {
      const {index} = d;
      userClickFn(data.nodes[index]);
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  node.append("text")
    .attr('class', (d) => (d.classes || '') + ' name')
    .text((d) => d.id)
    .attr('x', 6)
    .attr('y', 3);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
  });

  return svg.node();
};

const getUuid = () => crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
const worker = new Worker('./worker.js');
const workerFnWrapper = (method, param) => new Promise((resolve, reject) => {
  const uuid = getUuid();
  worker.postMessage({
    id: uuid,
    method,
    param
  });

  const handleMessage = (ev) => {
    if (ev.data.id === uuid) {
      worker.removeEventListener('message', handleMessage);
      const { result, error } = ev.data;
      if(result) { resolve(result); }
      if(error) { reject(error); }
    }
  };
  worker.addEventListener('message', handleMessage);
});

/**
 * Create and add a BrainWeb graph to document
 * @param {string} sel Selector for the element where the graph will be added
 * @param {array} people People in the graph
 * @param {string} userDisplayName Name of the current user
 * @param {function} userClickFn Function to call when a user node is clicked
 * @returns {void}
 */
export const addBrainWebToElement = async ({
  sel,
  people,
  userDisplayName,
  userClickFn
}) => {
  const el = document.querySelector(sel);
  const width = el.offsetWidth;
  const height = el.offsetHeight;

  // compute the network
  const {
    prunedNetwork,
    radius
  } = await workerFnWrapper('addBrainWebToElement', {
    people,
    userDisplayName,
    width,
    height
  });

  // draw and display
  const mysvg = chart(prunedNetwork, {width, height, radius, userClickFn});
  el.innerHTML = "";
  el.appendChild(mysvg);

  /**
   * Debug function to download the network. Call from the console.
   * @returns {void}
   */
  window.saveNetwork = () => {
    const text = JSON.stringify(prunedNetwork, null, 2);
    const elem = document.createElement("a");
    elem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    elem.setAttribute("download", "network.json");
    elem.click();
  };

  window.updateNetwork = (filterPeople) => {
    window.theSVG
      .selectAll(".node")
      .filter((d) => !filterPeople.includes(d.id))
      .attr("visibility", "hidden");
    window.theSVG
      .selectAll(".node")
      .filter((d) => filterPeople.includes(d.id))
      .attr("visibility", "visible");
  };
};
