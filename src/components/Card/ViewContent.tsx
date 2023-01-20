import { motion, useAnimationControls } from 'framer-motion';
import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const PinIcon = styled.svg`
  width: 18px;
  height: 18px;
`;

const PinIconPath = styled.path`
  fill: var(--highlight-color);
`;

const Name = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
  &:not(:first-child) {
    margin-left: 4px;
  }
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
  display: none;
  position: absolute;
  top: 16px;
  right: 20px;
  width: 34px;
  height: 34px;
  border-radius: 4px;
  &:hover {
    background-color: #eaf2fdd1;
  }
  ${Wrapper}:hover & {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const EditIcon = styled.svg`
  width: 14px;
  height: 14px;
`;

const EditIconPath = styled.path`
  fill: #0095ffbf;
`;

interface ViewContentProps {
  person: Person;
  transitionDuration: number;
  isShadow: boolean;
}

const ViewContent: FC<ViewContentProps> = ({ person, transitionDuration, isShadow }) => {
  const controls = useAnimationControls();
  const { search } = useLocation();
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
          {person.isPinned &&
            <PinIcon
              width='24'
              height='24'
              viewBox='0 0 24 24'
            >
              <path
                fill='none'
                d='M0 0h24v24H0z'
              />
              <PinIconPath d='M17 4a2 2 0 0 0-2-2H9c-1.1 0-2 .9-2 2v7l-2 3v2h6v5l1 1 1-1v-5h6v-2l-2-3V4z' />
            </PinIcon>
          }
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
        <StyledLink
          to={`${person.id}${search}`}
          title='Edit Card'
        >
          {/* <EditIcon viewBox='0 0 20 20'>
            <EditIconPath d='M19.7858 4.60461L15.3955 0.214286C15.1293 -0.0518161 14.7303 -0.0518161 14.4642 0.214286L0.229304 14.4492C0.096369 14.5821 0.0297852 14.7819 0.0297852 14.9814L0.462225 18.9393C0.4954 19.2385 0.728328 19.5046 1.06077 19.5378L5.01866 19.9703H5.08525C5.25159 19.9703 5.41793 19.9037 5.55086 19.7707L19.7858 5.53584C19.9187 5.40291 19.9853 5.23656 19.9853 5.07023C19.9853 4.90388 19.9187 4.73754 19.7858 4.60461L19.7858 4.60461ZM4.85244 18.6067L1.72602 18.274L1.39334 15.1476L14.9298 1.61113L18.3886 5.06996L4.85244 18.6067Z' fill='black' />
          </EditIcon> */}
          <EditIcon viewBox='0 0 20 20'>
            <EditIconPath d='M18.6421 5.30531C19.0526 4.89479 19.0526 4.21058 18.6421 3.8211L16.1789 1.35794C15.7895 0.947417 15.1053 0.947417 14.6947 1.35794L12.7579 3.28426L16.7053 7.23163M0 16.0527V20.0001H3.94737L15.5895 8.34742L11.6421 4.40005L0 16.0527Z' fill='black' />
          </EditIcon>
        </StyledLink>
      </ContentContainer>
    </Wrapper>
  );
};

export {
  ViewContent,
  type ViewContentProps,
};
