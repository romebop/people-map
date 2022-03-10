import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';

import { Person } from 'src/types';

import './Graph.scss';

interface GraphProps {
  people: Person[];
} 

// eslint-disable-next-line no-empty-pattern
const Graph: FC<GraphProps> = ({ people }: GraphProps) => {

  const svgRef = useRef<SVGSVGElement>(null);

  const getGraph = (people: Person[]) => ({
    nodes: [
      { name: 'me' },
      ...people.map(({ name }) => ({ name })),
    ],
    links: people.map(({ name }) => ({
      source: 'me',
      target: name,
    })),
  });

  useEffect(() => {

    const { nodes, links } = getGraph(people);
    
    const svg = d3.select(svgRef.current);
    const width = 540;
    const height = 400;
    const color = d3.scaleOrdinal(d3.schemePastel2);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.name))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1)
        .attr('stroke-linecap', 'round')
      .selectAll('line')
      .data(links)
      .join('line');
    
    const node = svg.append('g')
        .attr('stroke', '#ccc')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
      .selectAll('circle')
      // .selectAll('g')
      .data(nodes)
      .join('circle')
        .attr('r', 10)
        .attr('fill', d => color(d.name))
        .call(drag(simulation) as any);

    node.append('title').text((d: any) => d.name);

    function ticked() {
      link.attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    }

    function drag(simulation: any) {
      function dragStarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragEnded(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded);
    }
  
  }, [people]);

  return (
    <svg
      id='d3-svg'
      ref={svgRef}
    ></svg>
  );
}

export { Graph };