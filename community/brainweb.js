function chart(data, {width, height, radius, clickCallback}) {
  const nodes = data.nodes;
  const links = data.links;
  const simulation = d3.forceSimulation(nodes)
    .velocityDecay(0.1)
    .force("link", d3.forceLink(links).id(d => d.id).distance((link) => {
      const dist = Math.sqrt((link.source.x - link.target.x)**2 + (link.source.y - link.target.y)**2);
      return dist;
    }))
    .force("collision", d3.forceCollide(5));

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "background-color: rgba(0,0,0,0)");

  const link = svg
    .append("g")
    .attr("stroke", "#faa")
    .attr("stroke-opacity", 0.3)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr('class', 'link')
      .attr("stroke-width", d => Math.pow(d.value,1/4));

  function mouseover() {
    d3.select(this).transition()
      .duration(50)
      .attr("r", radius * 2);
  }

  function mouseout() {
    d3.select(this).transition()
      .duration(50)
      .attr("r", radius);
  }

  const node = svg.append("g")
    .selectAll(".node")
    .data(nodes)
    .join("g")
      .attr('class', 'node')
      .call(drag(simulation))

  const scale = d3.scaleOrdinal(d3.schemePaired);
  node.append('circle')
    .attr('class', (d) => d.classes || '')
    .attr("r", radius)
    .attr("fill", (d)=>{return scale(d.group);})
    .on("click", (d) => {
      const {index} = d;
      clickCallback(data.nodes[index]);
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
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x}, ${d.y})`);
  });

  return svg.node();
}

const drag = (simulation) => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

const color = function () {
  const scale = d3.scaleOrdinal(d3.schemePaired);
  return d => scale(d.group);
}

function openUserCard(user) {
  console.log("Click on node", index);
  return user;
}

const worker = new Worker('./worker.js')

function getUuid(){
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
}

function workerFnWrapper(method, param){
    return new Promise((rs, rj) => {
        const uuid = getUuid()
        worker.postMessage({
            id: uuid,
            method,
            param
        })

        const handleMessage = ev => {
            if (ev.data.id === uuid) {
                worker.removeEventListener('message', handleMessage)
                const { result, error } = ev.data
                result && rs(result)
                error && rj(error)
            }
        }
        worker.addEventListener('message', handleMessage)
    })
}

async function addBrainWebToElement(el, people, loggedDisplayName, clickCallback) {
    const {
        prunedNetwork,
        width,
        height,
        radius
    } = await workerFnWrapper('addBrainWebToElement', {
        people,
        loggedDisplayName
    })
    // display network
    const mysvg = chart(prunedNetwork, {width, height, radius, clickCallback});
    document.querySelector(el).innerHTML="";
    document.querySelector(el).appendChild(mysvg);
}
