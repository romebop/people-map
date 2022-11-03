import { motion } from 'framer-motion';
import { FC } from 'react';
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

const ContentContainer = styled(motion.div)``;

interface EditContentProps {
  person: Person;
  transitionDuration: number;
}

const EditContent: FC<EditContentProps> = ({ person, transitionDuration }) => (
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
      More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content More Content
    </ContentContainer>
  </Wrapper>
);

export {
  EditContent,
  type EditContentProps,
};
