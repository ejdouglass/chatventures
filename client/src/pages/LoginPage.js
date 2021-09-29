import React, {useState, useEffect} from 'react';
import { actions } from '../context';
import { CenteredFullPage, InputContainer, InputLabel, Input, LoginCard, WelcomeTitle, WelcomeButton, WelcomePrompt } from '../components/globalStyles';
import axios from 'axios';

export default function LoginPage({ dispatch }) {
    const [loginCredentials, setLoginCredentials] = useState({
        username: '',
        password: ''
    });
    const STATUS = {
        IDLE: 'idle',
        SUBMITTING: 'submitting',
        SUBMITTED: 'submitted',
        COMPLETED: 'completed'
    }
    const [status, setStatus] = useState(STATUS.IDLE);
    // can consider adding another state variable here to check when fields are 'touched' to display additional input information

    function navToCreatePage() {
        dispatch({type: actions.UPDATE_APPSTATE, payload: 'createChatventurer'});
    }

    function handleLogin(e) {
        e.preventDefault();
        let errorMessage = '';
        if (loginCredentials.username.length < 6 || loginCredentials.username.length > 12) errorMessage = `Character name should be between 6 and 12 characters in length. `;
        if (loginCredentials.password.length < 5) errorMessage += `Passwords can't be less than 5 characters long (and even that is kind of dangerously short).`;
        if (errorMessage) return alert(`YIKES error: ${errorMessage}`);
        
        // HERE: add feedback alert for 'logging in...' and 'welcome back, <character.name!>
        axios.post('/character/login', { userCredentials: loginCredentials })
        .then(res => {
            localStorage.setItem('townshipJWT', res.data.payload.token);
            dispatch({type: actions.LOAD_CHAR, payload: { character: res.data.payload.character}});
            // HERE: dispatch for 'play game mode'
            // HM, soon to figure out how to get the socket connected, as well, which will happen in the MainView area (conditionally on being actually logged in)
        })
        .catch(err => {
            console.log(`Error logging in: ${err}`);
            // HERE: dispatch for user alert/feedback
        })        
        
    }

    useEffect(() => {

    }, []);

    return (
        <CenteredFullPage>
            <LoginCard onSubmit={handleLogin}>

                <WelcomeTitle>Welcome to TOWNSHIP CHATVENTURERS! Let's log in.</WelcomeTitle>

                <InputContainer>
                    <InputLabel>Character Name</InputLabel>
                    <Input type='text' minLength={6} maxLength={12} value={loginCredentials.username} onChange={e => setLoginCredentials({...loginCredentials, username: e.target.value})}></Input>
                </InputContainer>

                <InputContainer>
                    <InputLabel>Password</InputLabel>
                    <Input type='password' minLength={5} value={loginCredentials.password} onChange={e => setLoginCredentials({...loginCredentials, password: e.target.value})}></Input>
                </InputContainer>

                <WelcomeButton onClick={handleLogin}>LOG IN!</WelcomeButton>

                <WelcomePrompt>Or if you're new here...</WelcomePrompt>

                <WelcomeButton type="button" onClick={navToCreatePage}>TO CHAR CREATION</WelcomeButton>

                

            </LoginCard>

        </CenteredFullPage>
    )
}