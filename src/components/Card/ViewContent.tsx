import { FC, RefObject, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';

import { Person } from 'src/types';
import { getNameById, PeopleCtx } from 'src/util';

const sidePadding = 24;
const Wrapper = styled.div<{ isShadow: boolean }>`
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
  padding: 26px ${sidePadding}px 34px ${sidePadding}px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: var(--shadow-elevation-medium);
  &:hover {
    background-color: #fafdff;
  }
  transition: all 0.1s ease-in;
`;

const ContentContainer = styled.div``;

const styledLinkLen = 34;
const StyledLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  opacity: 0;
  position: absolute;
  top: 16px;
  right: 20px;
  width: ${styledLinkLen}px;
  height: ${styledLinkLen}px;
  border-radius: 4px;
  &:hover {
    background-color: #eaf2fdd1;
  }
  ${Wrapper}:hover & {
    pointer-events: auto;
    opacity: 1;
  }
  transition: opacity 0.1s ease-in;
`;

const editIconLen = 14;
const EditIcon = styled.svg`
  width: ${editIconLen}px;
  height: ${editIconLen}px;
`;

const EditIconPath = styled.path`
  fill: #0095ffbf;
`;

const TitleSection = styled.div`
  display: flex;
  margin-bottom: 12px;
`;

const pinIconLen = 18;
const PinIcon = styled.svg`
  width: ${pinIconLen}px;
  height: ${pinIconLen}px;
  flex-shrink: 0;
`;

const PinIconPath = styled.path`
  fill: var(--highlight-color);
`;

const spacingMargin = 4;
const Name = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: calc(100% - ${pinIconLen}px - ${spacingMargin}px - ${styledLinkLen}px);
  &:not(:first-child) {
    margin-left: ${spacingMargin}px;
  }
`;

const NamePlaceholder = styled.div`
  opacity: 0.4;
  font-size: 14px;
  &:not(:first-child) {
    margin-left: ${spacingMargin}px;
  }
`;

const TagsSection = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const CommunityChip = styled.div`
  color: #1c65d2;
  border: 1px solid #1c65d2; 
  font-size: 12px;
  border-radius: 2px;
  padding: 2px 4px;
`;

const ConnectionChip = styled.div`
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

const lineHeight = 1.5;
const fontSize = 14;
const markerHeightOffset = 2;
const Note = styled.div`
  line-height: ${lineHeight};
  font-size: ${fontSize}px;
  word-break: break-word;
  white-space: pre-wrap;
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

const NotesPlaceholder = styled.pre`
  margin-top: 18px;
  opacity: 0.4;
  font-size: 14px;
`;

interface ViewContentProps {
  person: Person;
  isShadow: boolean;
  lastCardRef: RefObject<HTMLDivElement> | null;
}

const ViewContent: FC<ViewContentProps> = ({ person, isShadow, lastCardRef }) => {
  
  const { search } = useLocation();
  const { staleState } = useContext(PeopleCtx)!;

  return (
    <Wrapper
      {...{ isShadow }}
      ref={lastCardRef}
    >
      <ContentContainer>
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
          {person.name.trim() === ''
            ? <NamePlaceholder>awaiting name.. （・⊝・ ∞）</NamePlaceholder>
            : <Name>{person.name}</Name>
          }
        </TitleSection>
        {person.communities.length > 0 &&
          <TagsSection>
            {person.communities.map(community => {
              return <CommunityChip key={community}>{community}</CommunityChip>
            })}
          </TagsSection>
        }
        {person.connections.length > 0 &&
          <TagsSection>
            {person.connections.map(connectionId => {
              const connectionName = getNameById(staleState, connectionId);
              const displayName = connectionName.trim() === '' ? '（・⊝・ ∞）' : connectionName;
              return <ConnectionChip key={connectionId}>{displayName}</ConnectionChip>
            })}
          </TagsSection>
        }
        {person.notes.length > 0
          ? <NoteSection>
              {person.notes.map(n =>
                <Note key={n.id}>{n.content}</Note>
              )}
            </NoteSection>
          : <NotesPlaceholder>awaiting notes..   ( ´(ｴ) ˋ  )</NotesPlaceholder>
        }
        <StyledLink
          to={`${person.id}${search}`}
          title='Edit Card'
        >
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
