import { motion, useAnimationControls } from 'framer-motion';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';

import { Person } from 'src/types';

const sidePadding = 20;
const Wrapper = styled(({ isShadow, ...props }) => (
  <motion.div {...props} />
))<{ isShadow: boolean }>`
  ${({ isShadow }) =>
    isShadow
      ? `
           visibility: hidden;
           pointer-events: none;
        `
      : `
           position: absolute;
           top: 0;
        `
  }
  height: 100%;
  pointer-events: auto;
  overflow: hidden;
  width: var(--standard-width);
  margin: 0 auto;
  background-color: #fff;
  padding: 24px ${sidePadding}px 34px ${sidePadding}px;
  box-sizing: border-box;
`;

const ContentContainer = styled(motion.div)``;

const TitleSection = styled.div`
  display: flex;
`;

const Name = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

const ConnectionSection = styled.div`
  margin-top: 12px;
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
  margin-top: 18px;
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

const StyledLink = styled(Link)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

interface ViewContentProps {
  person: Person;
  isShadow: boolean;
  transitionDuration: number;
}

const ViewContent: FC<ViewContentProps> = ({ person, isShadow, transitionDuration }) => {

  const controls = useAnimationControls();

  return (
    <Wrapper
      {...{ isShadow }}
      layoutId={isShadow ? undefined : person.id}
      animate={controls}
      onLayoutAnimationStart={() => controls.start({ zIndex: 1 })}
      onLayoutAnimationComplete={() => controls.start({ zIndex: 0 })}
      transition={{ duration: transitionDuration }}
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: 'var(--shadow-elevation-medium)',
      }}
    >
      <ContentContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: transitionDuration / 2,
          duration: transitionDuration,
          ease: 'easeInOut',
        }}
      >
        <TitleSection>
          <Name>{person.name}</Name>
        </TitleSection>
        <ConnectionSection>
          {person.connections.map(c =>
            <Chip key={c.id}>{c.name}</Chip>
          )}
        </ConnectionSection>
        <NoteSection>
          {person.notes.map(n =>
            <Note key={n.id}>{n.content}</Note>
          )}
        </NoteSection>
      </ContentContainer>
      <StyledLink to={person.id} />
    </Wrapper>
  );
};

export {
  ViewContent,
  type ViewContentProps,
};
