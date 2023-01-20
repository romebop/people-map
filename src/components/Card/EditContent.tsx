import { format } from 'date-fns'; 
import { motion, Reorder } from 'framer-motion';
import Fuse from 'fuse.js';
import { FC, useContext, useState } from 'react';
import styled from 'styled-components/macro';
import { FocusableItem, Menu, MenuGroup, MenuItem } from '@szhsin/react-menu';

import { Chip } from './Chip';
import { Note } from './Note';
import { Connection, Person, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

const sidePadding = 20;
const Wrapper = styled(motion.div)`
  position: fixed;
  top: 20%;
  z-index: 1;
  background-color: #fff;
  padding: 24px 0px 34px 0px;
  box-sizing: border-box;
  width: var(--standard-width);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled(motion.div)`
  width: 100%;
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${sidePadding}px;
`;

const PinButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const PinIcon = styled.svg`
  width: 18px;
  height: 18px;
  ${PinButton}:active & {
    fill: var(--active-color);
  }
`;

const PinIconPath = styled.path`
  fill: var(--highlight-color);
  ${PinButton}:active & {
    fill: var(--active-color);
  }
`;

const NameText = styled.div`
  font-weight: 500;
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-left: 4px;
`;

const StyledMenu = styled(Menu)`
  font-size: 13px;
  padding: 8px 0;
`;

const StyledMenuItem = styled(MenuItem)`
  &:active {
    background-color: var(--highlight-color) !important;
    color: #fff;
  }
  &:hover {
    background-color: var(--gray-highlight-color);
  }
`;

const MoreButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  box-sizing: border-box;
  margin-left: auto;
  width: 28px;
  height: 26px;
  border-radius: 3px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  ${({ isOpen }) => isOpen && `
    background-color: #fff;
    border: 1px solid #ccc;  
  `}
  &:hover {
    background-color: #fff;
    border: 1px solid #ccc;
  }
  &:active {
    background-color: var(--gray-highlight-color);
  }
  ${TopSection}:hover & {
    visibility: visible;
  }
`;

const MoreIcon = styled.svg`
  width: 18px;
  height: 18px;
`;

const Connections = styled.div<{ show: boolean }>`
  margin-top: 12px;
  display: ${({ show }) => show ? 'flex' : 'none'};
  flex-wrap: wrap;
  gap: 6px;
  box-sizing: border-box;
  padding: 0 ${sidePadding}px;
`;

const AddConnectionButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  width: 30px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  color: #aaa;
  font-size: 16px;
  &:active {
    background-color: #0095ff08;
    border: 1px solid #0095ff5c;
  }
  ${({ isOpen }) => isOpen && `
    border: 1px solid #ccc;
  `};
  &:hover {
    border: 1px solid #ccc;
  }
  ${Connections}:hover & {
    display: flex;
  }
`;

const AddConnectionIcon = styled.svg`
  stroke: #888;
  width: 12px;
  height: 12px;
  ${AddConnectionButton}:active & {
    stroke: #0095ff;
  }
`;

const ConnectionFilterInput = styled.input`
  cursor: text;
  border-bottom: 1px solid #0095ff;
  padding-bottom: 2px;
  width: 100%;
  &::placeholder {
    opacity: 0.4;
  }
`;

const NoConnectionsPlaceholder = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.375rem 1.5rem;
  font-style: italic;
  opacity: 0.3;
`;

const Notes = styled(Reorder.Group)`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  padding-inline-start: 0;
  margin-block-start: 0;
  margin-block-end: 0;
  box-shadow: inset 0 0 0 1000px rgb(0 0 0 / 5%);
`;

// const InputField = styled.div`
//   width: 100%;
//   padding: 8px;
//   box-sizing: border-box;
//   border-top: 1px solid transparent;
//   border-bottom: 1px solid transparent;
//   &:focus {
//     border-top: 1px solid #ccc;
//     border-bottom: 1px solid #ccc;
//     outline: 0px solid transparent;
//   }
// `;

interface EditContentProps {
  person: Person;
  transitionDuration: number;
}

const EditContent: FC<EditContentProps> = ({ person, transitionDuration }) => {

  // const myRef = useRef<HTMLDivElement>(null);
  const { allConnections, dispatch } = useContext(PeopleCtx)!;

  const [connectionFilter, setConnectionFilter] = useState<string>('');
  const searchableConnections = allConnections.filter(ac =>
    ac.id !== person.id
    && !person.connections.map(pc => pc.id).includes(ac.id)
  );
  const filteredConnections: Connection[] = connectionFilter
    ? new Fuse(searchableConnections, {
      keys: ['name'],
      threshold: 0.4,
    })
      .search(connectionFilter)
      .map(result => result.item)
    : searchableConnections;

  
  return (
    <Wrapper
      layoutId={person.id}
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
          ease: 'easeOut',
        }}
      >
        <TopSection>
          {person.isPinned
            ? <PinButton
                onClick={() => dispatch({
                  type: PeopleActionType.UNPIN_PERSON,
                  payload: { id: person.id },
                })}
                title='Unpin'
              >
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
              </PinButton>
            : <PinButton
                onClick={() => dispatch({
                  type: PeopleActionType.PIN_PERSON,
                  payload: { id: person.id },
                })}
                title='Pin'
              >
                <PinIcon
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                >
                  <path
                    fill='none'
                    d='M0 0h24v24H0z'
                  />
                <PinIconPath d='M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-1.1.9-2 2-2h6c1.11 0 2 .89 2 2zM9 4v7.75L7.5 14h9L15 11.75V4H9z' />
                </PinIcon>
              </PinButton>
          }
          <NameText title={format(person.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}>{person.name}</NameText>
          <StyledMenu
            menuButton={({ open }) =>
              <MoreButton isOpen={open}>
                <MoreIcon
                  className='more-icon'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='#444'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
                  />
                </MoreIcon>
              </MoreButton>}
            position='anchor'
          >
            <StyledMenuItem
              onClick={() => dispatch({
                type: PeopleActionType.DELETE_PERSON,
                payload: { id: person.id },
              })}
            >
              Delete card
            </StyledMenuItem>
          </StyledMenu>
        </TopSection>
        <Connections show={person.showConnections}>
          {person.connections.map(connection =>
            <Chip
              key={connection.id}
              personId={person.id}
              connection={connection}
            />
          )}
          <Menu
            menuClassName='menu'
            menuButton={({ open }) =>
              <AddConnectionButton
                isOpen={open}
                title='Add connection'
              >
                <AddConnectionIcon
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 4v16m8-8H4'
                  />
                </AddConnectionIcon>  
              </AddConnectionButton>}
            overflow='auto'
            setDownOverflow
            position='anchor'
            onMenuChange={e => e.open && setConnectionFilter('')}
          >
            <FocusableItem>
              {({ ref }) => (
                <ConnectionFilterInput
                  autoFocus
                  ref={ref}
                  type='text'
                  placeholder='Filter connections'
                  value={connectionFilter}
                  onChange={e => setConnectionFilter(e.target.value)}
                />
              )}
            </FocusableItem>
            {filteredConnections.length
              ? <MenuGroup takeOverflow>
                  {filteredConnections.map(({ name, id }) =>
                    <StyledMenuItem
                      key={id}
                      onClick={() => dispatch({
                        type: PeopleActionType.ADD_CONNECTION,
                        payload: { id: person.id, connection: { name, id } },
                      })}
                    >{name}</StyledMenuItem>)}
                </MenuGroup>
              : (searchableConnections.length && connectionFilter.trim().length)
                ? <NoConnectionsPlaceholder>Person not found</NoConnectionsPlaceholder>
                : <NoConnectionsPlaceholder>None available</NoConnectionsPlaceholder>}
          </Menu>
        </Connections>
        <Notes
          axis='y'
          values={person.notes}
          onReorder={notes => dispatch({
            type: PeopleActionType.REORDER_NOTES,
            payload: { id: person.id, notes },
          })}
        >
          {person.notes.map(note => (
            <Note {...{ note }} key={note.id} />
          ))}
        </Notes>
        <div>test</div>
        {/* <InputField
          ref={myRef}
          placeholder='hello'
          contentEditable='true'
        />
        <button onClick={() => alert(myRef.current?.innerText)}>click me</button> */}
      </ContentContainer>
    </Wrapper>
  );
};

export {
  EditContent,
  type EditContentProps,
};
