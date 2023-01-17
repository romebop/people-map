import { format } from 'date-fns'; 
import { motion } from 'framer-motion';
import { FC, useContext } from 'react';
import styled from 'styled-components/macro';

import { Person, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

const sidePadding = 20;
const Wrapper = styled(motion.div)`
  position: fixed;
  top: 20%;
  z-index: 1;
  background-color: #fff;
  padding: 24px ${sidePadding}px 34px ${sidePadding}px;
  box-sizing: border-box;
  width: var(--standard-width);
  height: 500px;
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
  border-bottom: 1px solid #efefef;
  padding: 12px 20px 14px 20px;
  // background-color: var(--card-shade);
`;

const PinButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-right: 8px;
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
  margin-right: 6px;
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
  const { dispatch } = useContext(PeopleCtx)!;
  
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
              </PinButton>}
          <NameText title={format(person.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}>{person.name}</NameText>
        </TopSection>

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
