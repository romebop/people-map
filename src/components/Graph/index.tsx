import * as d3 from 'd3';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';

import { Checkbox } from './Checkbox';
import { Person } from 'src/types';
import { getNameById, PeopleCtx } from 'src/util';

type Node = { name: string, isPinned: boolean, communities: string[] };
type Link = { source: string, target: string };

const RootSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
`;

const padding = 60;
const CheckboxesContainer = styled.div<{ topContainerWidth: number }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
  position: absolute;
  top: 40px;
  transform: translateX(calc(50% + ${({ topContainerWidth }) => topContainerWidth / 2}px + ${padding}px));
  opacity: ${({ topContainerWidth }) => topContainerWidth === 0 ? 0 : 1};
`;

interface GraphProps {
  topContainerWidth: number;
}

const Graph: FC<GraphProps> = ({ topContainerWidth }) => {

  const { sortedFilteredPeople: people, state: allPeople } = useContext(PeopleCtx)!;
  const [graphConfig, setGraphConfig] = useState<Record<string, boolean>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const getGraph = useCallback((people: Person[]): { nodes: Node[], links: Link[] } => ({
    nodes: [
      { name: 'me', isPinned: false, communities: [] },
      ...people.map(({ name, isPinned, communities }) => ({ name, isPinned, communities })),
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
     
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.name).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(1))
      .on('tick', ticked);

    const color = d3.scaleOrdinal(d3.schemePastel2);

    const linksG = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1)
      .attr('stroke-linecap', 'round');

    const link = linksG.selectAll('line')
      .data(links)
      .join('line');
    
    const nodesG = svg.append('g');

    const nodeG = nodesG.selectAll('g')
      .data(nodes)
      .join('g')
        .call(drag(simulation) as any);

    nodeG.append('circle')
      .attr('stroke', '#ccc')
      .attr('stroke-opacity', 1)
      .attr('r', d => d.name === 'me' ? 24 : 16)
      .attr('stroke-width', d => d.name === 'me' ? 4 : 3)
      .attr('fill', d => d.name === 'me' ? '#fff' : color(d.name))
      .style('cursor', 'pointer');

    nodeG.append('text')
      .text(d => d.name)
      .attr('fill', 'gray')
      .attr('stroke', 'none')
      .attr('font-size', '0.7em')
      .attr('x', 0)
      .attr('y', d => d.name === 'me' ? -30 : -20)
      .attr('font-size', 14);
    
    function ticked() {
      link.attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      nodeG.attr('transform', (d: any) => `translate(${d.x} ${d.y})`);
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

    const zoom = d3.zoom<SVGSVGElement, SVGGElement>()
      .extent([[0, 0], [width, height]])
      .translateExtent([[0, 0], [width, height]])
      .scaleExtent([1, 10])
      .on('zoom', handleZoom);

    function handleZoom({ transform }: d3.D3ZoomEvent<SVGSVGElement, SVGGElement>) {
      nodesG.attr('transform', transform.toString());
      linksG.attr('transform', transform.toString());
    }

    (svg as d3.Selection<SVGSVGElement, any, null, undefined>).call(zoom);

  }, [getGraph, graphConfig, people, width, height]);

  useEffect(() => {
    const storedConfig = localStorage.getItem('graphConfig');
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      setGraphConfig(parsedConfig);
    } else {
      setGraphConfig({
        name: true,
        pin: false,
        community: false,
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('graphConfig', JSON.stringify(graphConfig));
  }, [graphConfig]);

  return (
    <>
      <RootSvg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      />
      <CheckboxesContainer {...{ topContainerWidth }}>
        {Object.entries(graphConfig).map(([key, val]) => (
          <Checkbox
            key={key}
            label={`${key.charAt(0).toUpperCase() + key.slice(1)} indicator`}
            handleChange={isChecked => setGraphConfig(prevConfig => ({ ...prevConfig, [key]: isChecked }))}
            isChecked={val}
          />
        ))}
      </CheckboxesContainer>
    </>
  );
};

export { Graph };
