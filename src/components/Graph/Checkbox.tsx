import { FC } from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  display: flex;
  align-items: center;
  z-index: 1;
  cursor: pointer;
  &:not(:first-child) {
    margin-top: 12px;
  }
`;

const len = 14;
const StyledInput = styled.input`
  appearance: none;
  background-color: #fff;
  margin: 0 8px 0 0;
  width: ${len}px;
  height: ${len}px;
  border: 2px solid #777;
  border-radius: 4px;
  transform: translateY(-0.075em);
  display: grid;
  place-content: center;
  &:before {
    content: '';
    width: ${len - 4}px;
    height: ${len - 4}px;
    border-radius: 1px;
    transform: scale(0);
    transition: 0.05s transform ease-in;
    box-shadow: inset ${len - 4}px ${len - 4}px #5cbbff;
  }
  &:checked:before {
    transform: scale(1);
  }
`;

const StyledLabel = styled.label`
  color: #777;
  user-select: none;
  cursor: pointer;
`;

interface CheckboxProps {
  label: string;
  handleChange: (isChecked: boolean) => void;
  isChecked: boolean;
}

const Checkbox: FC<CheckboxProps> = ({ label, handleChange, isChecked }) => {

  const hyphenatedLabel = label.replace(/\s+/g, '-');

  return (
    <Container>
      <StyledInput
        type='checkbox'
        id={`${hyphenatedLabel}-checkbox`}
        checked={isChecked}
        onChange={e => {
          handleChange(e.target.checked);
        }}
      />
      <StyledLabel htmlFor={`${hyphenatedLabel}-checkbox`}>{label}</StyledLabel>
    </Container>
  )
};

export {
  Checkbox,
  type CheckboxProps,
};
