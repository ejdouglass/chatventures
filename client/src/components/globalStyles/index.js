import styled, { keyframes, css } from 'styled-components';

// HERE: global's global-est variables for sizing, colors, etc.
// ...

export const appDefault = {
    margin: 'calc(0.5rem + 0.5vw)',
    fontSize: 'calc(0.5rem + 0.5vw)'
}

export const CenteredFullPage = styled.div`
    display: flex;
    width: 100vw;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 1rem;
`;

export const LoginCard = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 2rem 0;
    width: calc(200px + 50vw);
    margin-top: 2rem;
    border: 1px solid black;
    border-radius: 0.8rem;
`;

export const CreateChatventurerCard = styled(LoginCard)`

`;

export const WelcomeTitle = styled.h1`
    font-family: sans-serif;
    font-size: calc(1.5rem + 0.5vw);
    width: 100%;
    text-align: center
`;

export const WelcomeButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: calc(0.5rem + 0.5vw);
    background: blue;
    color: white;
    padding: 1rem;
    width: 250px;
    border-radius: 1rem;
    font-weight: 600;
    letter-spacing: 2px;
    border: 0;
    margin-top: 1rem;
`;

export const WelcomePrompt = styled.p`
    margin: 0;
    margin-top: 1rem;
    font-size: calc(0.5rem + 0.5vw);
`;

export const InputContainer = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    width: calc(150px + 50%);
    padding: ${appDefault.margin};
    margin-top: ${appDefault.margin};
    font-size: ${appDefault.fontSize};
    border: 1px solid hsla(0,0%,90%,0.5);
`;

export const InputLabel = styled.label`
    display: flex;
    position: absolute;
    top: 0;
    left: calc(25% + 0.25vw + 0.25rem);
`;

export const Input = styled.input`
    display: flex;
    margin-top: 0.5rem;
    padding: 0.5rem;
    font-size: ${appDefault.fontSize};
    width: 50%;
`;

export const NewCharacterImgContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100px + 10vw);
    height: calc(100px + 10vw);
    background: #0AF;
    border-radius: 0.5rem;
`;