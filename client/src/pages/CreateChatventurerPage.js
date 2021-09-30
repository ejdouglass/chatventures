import React, {useState} from 'react';
import { actions } from '../context';
import { CenteredFullPage, InputContainer, InputLabel, Input, LoginCard, WelcomeTitle, WelcomeButton, WelcomePrompt, NewCharacterImgContainer } from '../components/globalStyles';
import axios from 'axios';

export default function CreateChatventurerPage({ dispatch }) {
    const [newUser, setNewUser] = useState({
        name: '',
        password: '',
        confirmedPassword: '',
        stats: {
            strength: 10,
            dexterity: 10,
            vitality: 10,
            willpower: 10,
            intelligence: 10,
            wisdom: 10,
            spirit: 10
        }
    });

    function navToLoginPage() {
        dispatch({type: actions.UPDATE_APPSTATE, payload: 'login'});
    }

    function handleCreation(e) {
        e.preventDefault();
        let errorMessage = '';


        // HERE: add feedback alert for 'creating new character...' and 'welcome to Zenithica, <character.name!>
        axios.post('/user/create', { newUser: newUser })
        .then(res => {
            console.log(`CREATION RESPONSE FROM SERVER: ${JSON.stringify(res.data)}`);
            localStorage.setItem('townshipJWT', res.data.payload.token);
            console.log(`Ok, here goes nothing: loading ${res.data.payload.user} into state.`);
            dispatch({type: actions.LOAD_CHARACTER, payload: res.data.payload.user});
            // HERE: dispatch for 'play game mode'
            // HM, soon to figure out how to get the socket connected, as well, which will happen in the MainView area (conditionally on being actually logged in)
        })
        .catch(err => {
            console.log(`Error creating new character: ${err}`);
            // HERE: dispatch for user alert/feedback
        })  
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
                    <Input type='text' value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}></Input>
                </InputContainer>

                <InputContainer>
                    <InputLabel>Password</InputLabel>
                    <Input type='password' value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}></Input>
                </InputContainer>
                
                <InputContainer>
                    <InputLabel>Confirm Password</InputLabel>
                    <Input type='password' value={newUser.confirmedPassword} onChange={e => setNewUser({...newUser, confirmedPassword: e.target.value})}></Input>
                </InputContainer>

                <WelcomeButton onClick={handleCreation}>CREATE NEW CHARACTER!</WelcomeButton>

                <WelcomePrompt>Or if you accidentally'd yourself over here then head back to</WelcomePrompt>

                <WelcomeButton type="button" onClick={navToLoginPage}>TO LOG IN PAGE</WelcomeButton>

                

            </LoginCard>

        </CenteredFullPage>
    )
}