// import { motion } from 'framer-motion';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';

import { Connection, Person } from 'src/types';
import { Overlay } from 'src/components';

const sidePadding = 20;
const Container = styled.div`
  position: relative;
  box-shadow: var(--shadow-elevation-medium);
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 24px ${sidePadding}px 34px ${sidePadding}px;
  &:not(:first-child) {
    margin-top: 20px;
  }
  position: relative;
  z-index: 0;
`;

const TitleSection = styled.div`
  display: flex;
`;

const Name = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

const sectionMargin = 14;
const ConnectionSection = styled.div`
  margin-top: ${sectionMargin}px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.div`
  background-color: #eaf2fd;
  color: #1c65d2;
  font-size: 12px;
  border-radius: 2px;
  padding: 2px 4px;
`;

const NoteSection = styled.div`
  margin-top: ${sectionMargin}px;
  display: flex;
  flex-direction: column;
`;

const lineHeight = 1.6;
const fontSize = 14;
const markerHeightOffset = 2;
const Note = styled.div`
  line-height: ${lineHeight};
  font-size: ${fontSize}px;
  word-break: break-word;
  position: relative;
  &:before {
    content: '';
    height: ${fontSize - markerHeightOffset}px;
    width: 4px;
    position: absolute;
    left: -${sidePadding}px;
    top: ${Math.round(fontSize * (lineHeight - 1) / 2) + (markerHeightOffset / 2)}px;
    border-radius: 0 1px 1px 0;
    background-color: #0095ff45;
  }
  &:not(:first-child) {
    margin-top: 8px;
  }
`;

// const StyledLink = styled(Link)`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
// `;

 interface CardProps {
  person: Person;
  allConnections: Connection[];
  setSearchInputValue: (name: string) => void;
  isSelected: boolean;
}

const Card: FC<CardProps> = ({ person, allConnections, setSearchInputValue, isSelected }) => {
  return (
    <Container>
      <Overlay {...{ isSelected }}></Overlay>
      <TitleSection>
        <Name>{person.name}</Name>
      </TitleSection>
      <ConnectionSection>
        {person.connections.map(c =>
          <Chip key={c.id}>{c.name}</Chip>)
        }
      </ConnectionSection>
      <NoteSection>
        {person.notes.map(n =>
          <Note key={n.id}>{n.content}</Note>
        )}
      </NoteSection>
      {/* <StyledLink to={person.id} />*/}
    </Container>
  )
};

export {
  Card,
  type CardProps,
};
