import * as d3 from 'd3';
import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components/macro';

import { Person } from 'src/types';
import { getNameById, PeopleCtx } from 'src/util';

type Node = { name: string };
type Link = { source: string, target: string };

const RootSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
`;

const Graph: FC = () => {

  const { sortedFilteredPeople: people, state: allPeople } = useContext(PeopleCtx)!;
  const svgRef = useRef<SVGSVGElement>(null);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const getGraph = useCallback((people: Person[]): { nodes: Node[], links: Link[] } => ({
    nodes: [
      { name: 'me' },
      ...people.map(({ name }) => ({ name })),
    ],
    links: [
      ...people.map(({ name }) => ({
        source: 'me',
        target: name,
      })),
      ...people.map(
        p => p.connections.map(
          c => ({ source: p.name, target: getNameById(allPeople, c) })
        )
      )
      .flat()
      .filter(({ source, target }) =>
        people.some(p => p.name === source)
        && people.some(p => p.name === target)
      )
      .map(({ source, target }) =>
        source.localeCompare(target!) < 0
          ? { source, target }
          : { source: target, target: source }
      )
      .map(o => JSON.stringify(o))
      .filter((e, i, a) => i === a.indexOf(e))
      .map(s => JSON.parse(s)),
    ],
  }), [allPeople]);

  useEffect(() => {
    
    const { nodes, links } = getGraph(people);
   
    const svg = d3.select(svgRef.current);
    svg.selectAll('g').remove();

    const color = d3.scaleOrdinal(d3.schemePastel2);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.name).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-1000))
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
        .attr('stroke-opacity', 1)
      .selectAll('circle')
      // .selectAll('g')
      .data(nodes)
      .join('circle')
        .attr('stroke', '#ccc')
        .attr('r', d => {
          if (d.name === 'me') return 24;
          return 16;
        })
        .attr('stroke-width', d => {
          if (d.name === 'me') return 4;
          return 3;
        })
        .attr('fill', d => {
          if (d.name === 'me') return '#fff';
          return color(d.name);
        })
        .style('cursor', 'pointer')
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
  
  }, [getGraph, people, width, height]);

  return (
    <RootSvg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    />
  );
};

export { Graph };
