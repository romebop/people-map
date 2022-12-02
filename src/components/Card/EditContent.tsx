import { motion } from 'framer-motion';
import { FC, useRef } from 'react';
import styled from 'styled-components/macro';

import { Person } from 'src/types';

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

const InputField = styled.div`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;

  background-color: aliceblue;
`;

interface EditContentProps {
  person: Person;
  transitionDuration: number;
}

const EditContent: FC<EditContentProps> = ({ person, transitionDuration }) => {

  const myRef = useRef<HTMLDivElement>(null);
  
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
        <InputField
          ref={myRef}
          placeholder='hello'
          contentEditable='true'
        />
        <button onClick={() => alert(myRef.current?.innerText)}>click me</button>
      </ContentContainer>
    </Wrapper>
  );
};

export {
  EditContent,
  type EditContentProps,
};
