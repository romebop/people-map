import { motion } from 'framer-motion';
import { FC } from 'react';
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';

import { Person } from 'src/types';

const Container = styled(motion.div)`
  box-shadow: var(--shadow-elevation-low);
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 20px;
  &:not(:first-child) {
    margin-top: 40px;
  }
  position: relative;
  z-index: 0;
`;

const StyledLink = styled(Link)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

interface ViewCardProps {
  person: Person;
}

const ViewCard: FC<ViewCardProps> = ({ person }) => {
  return (
    <Container layoutId={person.id}>
      <div><b>{person.name}</b></div>
      <div>Connections:</div>
      {person.connections.map(c => <div key={c.id}>{c.name}</div>)}
      <div>Notes:</div>
      {person.notes.map(n => <div key={n.id}>{n.content}</div>)}
      <StyledLink to={person.id} />
    </Container>
  )
}

export {
  ViewCard,
  type ViewCardProps,
}
