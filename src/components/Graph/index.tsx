import * as d3 from 'd3';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';

import { Checkbox } from './Checkbox';
import { Person } from 'src/types';
import { getNameById, PeopleCtx } from 'src/util';

type Node = { name: string, isPinned: boolean, communities: string[], x?: number, y?: number };
type Link = { source: string, target: string };
type Hull = { id: string, path: [number, number][] };

const RootSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
`;

const padding = 24;
const CheckboxesContainer = styled.div<{ topContainerWidth: number }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
  position: absolute;
  top: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: ${padding}px ${padding + 40}px ${padding}px ${padding}px;
  opacity: ${({ topContainerWidth }) => topContainerWidth === 0 ? 0 : 1};
  right: 80px;

  @media (max-width: 1180px) {
    right: unset;
    transform: translateX(calc(50% + ${({ topContainerWidth }) => topContainerWidth / 2}px + 8px));
  }
`;

const ControlsLabel = styled.div`
  font-size: 14px;
  color: #555;
  text-decoration: underline;
  margin-bottom: 8px;
  `;

interface GraphProps {
  topContainerWidth: number;
}

const Graph: FC<GraphProps> = ({ topContainerWidth }) => {

  const { sortedFilteredPeople: people, state: allPeople } = useContext(PeopleCtx)!;
  const [graphConfig, setGraphConfig] = useState<Record<string, boolean> | null>(null);
  const [prevConfig, setPrevConfig] = useState<Record<string, boolean> | null>(null);
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

  const getHulls = useCallback((nodes: Node[]): Hull[] => {
    const offset = 40;
    const hulls: Hull[] = [];
    const communities = nodes.map(n => n.communities)
      .flat()
      .filter((c, i, a) => a.indexOf(c) === i);
    for (const community of communities) {
      const path: [number, number][] = [];
      for (const node of nodes) {
        if (!node.communities.includes(community)) continue;
        path.push([node.x! - offset, node.y! - offset]);
        path.push([node.x! - offset, node.y! + offset]);
        path.push([node.x! + offset, node.y! - offset]);
        path.push([node.x! + offset, node.y! + offset]);
      }
      hulls.push({ id: community, path: d3.polygonHull(path)! });
    }
    return hulls;
  }, []);

  let nodeGRef = useRef<any>(null);

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
    if (graphConfig) {
      localStorage.setItem('graphConfig', JSON.stringify(graphConfig));
    }
  }, [graphConfig]);

  useEffect(() => {
    
    const { nodes, links } = getGraph(people);
     
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.name).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(1))
      .on('tick', ticked);

    const curve = d3.line().curve(d3.curveCardinalClosed.tension(0.5));

    const color = d3.scaleOrdinal(d3.schemePastel2);

    const hullsG = svg.append('g');

    const hull = hullsG.selectAll('path')
      .data(getHulls(nodes))
      .join('path')
        .attr('d', (d: any) => curve(d.path))
        .style('fill', (d: any) => color(d.id))
        .style('opacity', 0.25);

    const linksG = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1)
      .attr('stroke-linecap', 'round');

    const link = linksG.selectAll('line')
      .data(links)
      .join('line');
    
    const nodesG = svg.append('g');

    nodeGRef.current = nodesG.selectAll('g')
      .data(nodes)
      .join('g')
        .call(drag(simulation) as any);

    nodeGRef.current.append('circle')
      .attr('stroke', '#ccc')
      .attr('stroke-opacity', 1)
      .attr('r', (d: any) => d.name === 'me' ? 24 : 16)
      .attr('stroke-width', (d: any) => d.name === 'me' ? 4 : 3)
      .attr('fill', (d: any) => d.name === 'me' ? '#fff' : color(d.name))
      .style('cursor', 'pointer');
    
    function ticked() {

      hull.data(getHulls(nodes))
        .attr('d', (d: any) => curve(d.path));

      link.attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
    
      nodeGRef.current.attr('transform', (d: any) => `translate(${d.x} ${d.y})`);

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

    return () => {
      simulation.stop();
    };
  
  }, [getGraph, getHulls, people, width, height]);

  useEffect(() => {

    if (graphConfig === null || nodeGRef.current === null) return;

    if (!prevConfig?.name && graphConfig.name) {
      nodeGRef.current.filter((d: any) => d.name !== 'me')
        .append('text')
        .text((d: any) => d.name)
        .attr('fill', 'gray')
        .attr('stroke', 'none')
        .attr('font-size', '0.7em')
        .attr('x', 0)
        .attr('y', -22)
        .attr('font-size', 14);
    }
    
    if (prevConfig?.name && !graphConfig.name) {
      nodeGRef.current.selectAll('text').remove();
    }

    if (!prevConfig?.pin && graphConfig.pin) {
      nodeGRef.current.filter((d: any) => d.isPinned)
        .append('path')
        .attr('d', 'M17 4a2 2 0 0 0-2-2H9c-1.1 0-2 .9-2 2v7l-2 3v2h6v5l1 1 1-1v-5h6v-2l-2-3V4z')
        .attr('transform', 'translate(-25, -38)')
        .style('fill', '#0095ff99');
    }

    if (prevConfig?.pin && !graphConfig.pin) {
      nodeGRef.current.selectAll('path').remove();
    }

  }, [graphConfig, prevConfig, people, width, height]);

  return (
    <>
      <RootSvg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      />
      <CheckboxesContainer {...{ topContainerWidth }}>
        <ControlsLabel>Toggle indicators</ControlsLabel>
        {graphConfig && Object.entries(graphConfig).map(([key, val]) => (
          <Checkbox
            key={key}
            label={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
            handleChange={isChecked => setGraphConfig(prevConfig => {
              setPrevConfig({ ...prevConfig });
              return { ...prevConfig, [key]: isChecked }; 
            })}
            isChecked={val}
          />
        ))}
      </CheckboxesContainer>
    </>
  );
};

export {
  Graph,
  type GraphProps,
};
