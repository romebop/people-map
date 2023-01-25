import { FC, useContext } from 'react';
import styled from 'styled-components/macro';

import { Overlay } from './Overlay';
import { EditContent } from './EditContent';
import { ViewContent } from './ViewContent';
import { Person } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled.div`
  position: relative;
  &:not(:first-child) {
    margin-top: 30px;
  }
`;

interface CardProps {
  person: Person;
  isSelected: boolean;
}

const Card: FC<CardProps> = ({ person, isSelected }) => {

  const { state: people } = useContext(PeopleCtx)!;
  const livePerson = people.find(p => p.id === person.id)!;

  return (
    <Container>
      <Overlay {...{ isSelected }} />
      <ViewContent
        {...{ person }}
        isShadow
      />
      {isSelected
        ? <EditContent {...{ person: livePerson }} /> 
        : <ViewContent
            {...{ person }}
            isShadow={false}
          />
      }
    </Container>
  )
};

export {
  Card,
  type CardProps,
};

// import { FC, useContext } from 'react';
// import styled from 'styled-components/macro';

// import { Overlay } from './Overlay';
// import { EditContent } from './EditContent';
// import { ViewContent } from './ViewContent';
// import { Person } from 'src/types';
// import { PeopleCtx } from 'src/util';

// const Container = styled.div`
//   position: relative;
//   &:not(:first-child) {
//     margin-top: 30px;
//   }
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   box-shadow: var(--shadow-elevation-medium);
// `;

// interface CardProps {
//   person: Person;
//   isSelected: boolean;
// }

// const transitionDuration = 0.2;
// const Card: FC<CardProps> = ({ person, isSelected }) => {

//   const { state: people } = useContext(PeopleCtx)!;
//   const livePerson = people.find(p => p.id === person.id)!;

//   return (
//     <Container>
//       <Overlay {...{ isSelected, transitionDuration }} />
//       <ViewContent
//         {...{ person, transitionDuration }}
//         isShadow
//       />
//       {isSelected
//         ? <EditContent {...{ person: livePerson, transitionDuration }} />
//         : <ViewContent
//           {...{ person, transitionDuration }}
//           isShadow={false}
//         />
//       }
//     </Container>
//   )
// };

// export {
//   Card,
//   type CardProps,
// };
