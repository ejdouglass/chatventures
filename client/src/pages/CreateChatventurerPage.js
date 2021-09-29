import React from 'react';
import { actions } from '../context';
import { CenteredFullPage, InputContainer, InputLabel, Input, LoginCard, WelcomeTitle, WelcomeButton, WelcomePrompt, NewCharacterImgContainer } from '../components/globalStyles';

export default function CreateChatventurerPage({ dispatch }) {

    function navToLoginPage() {
        dispatch({type: actions.UPDATE_APPSTATE, payload: 'login'});
    }

    function handleCreation(e) {
        e.preventDefault();
        let errorMessage = '';
    }

    return (
        <CenteredFullPage>
            <LoginCard onSubmit={handleCreation}>

                <WelcomeTitle>TIME TO MAKE A CHARACTER, hurrah!</WelcomeTitle>

                <NewCharacterImgContainer>
                    (char img goes here)
                </NewCharacterImgContainer>

                <InputContainer>
                    <InputLabel>Character Name</InputLabel>
                    <Input type='text'></Input>
                </InputContainer>

                <InputContainer>
                    <InputLabel>Password</InputLabel>
                    <Input type='password'></Input>
                </InputContainer>
                
                <InputContainer>
                    <InputLabel>Confirm Password</InputLabel>
                    <Input type='password'></Input>
                </InputContainer>

                <WelcomeButton onClick={handleCreation}>CREATE NEW CHARACTER!</WelcomeButton>

                <WelcomePrompt>Or if you accidentally'd yourself over here then head back to</WelcomePrompt>

                <WelcomeButton type="button" onClick={navToLoginPage}>TO LOG IN PAGE</WelcomeButton>

                

            </LoginCard>

        </CenteredFullPage>
    )
}