const promptInput = document.querySelector('#prompt-input');
const sendButton = document.querySelector('#send-btn');
const chatContainer = document.querySelector('.chat-container');
const themeButton = document.querySelector('#theme-btn');
const deleteButton = document.querySelector('#delete-btn');

let userInput = null;
const API_KEY = "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";
const initialHeight = promptInput.scrollHeight;

const loadFromLocalStorage =()=>{
    const themeType = localStorage.getItem("theme");
    document.body.classList.toggle("light-mode",themeType==="light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" :"light_mode";

    const welcomeText = `<div class='welcome-text'>
        <h6>Welcome to</h6>
        <h1>ChatGPT Clone</h1>
        <p>Start a conversation and explore the power of generative AI</p>
        <small>Your chats will be displayed here</small>
    </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || welcomeText;
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
}

loadFromLocalStorage();

const createChatElement = (html,className) =>{
    //for creating chat div with prompt and solution classes
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat",className);
    chatDiv.innerHTML = html;
    return chatDiv
}

const getPromptResponse = async(solutionChatDiv)=>{
    const API_URL = "https://api.openai.com/v1/completions";
    const paragraphElement = document.createElement("p")

    const apiRequest ={
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model:"gpt-3.5-turbo-instruct",
            prompt:userInput,
            max_tokens:2048,
            temperature:0.2,
            n:1,
            stop:null
        })
    }

    //api request and getting response
    try{
        const response = await (await fetch(API_URL,apiRequest)).json();
        console.log(response);
        paragraphElement.textContent = response?.choices[0]?.text.trim()
    }
    catch(error){
        paragraphElement.classList.add("error");
        paragraphElement.textContent = "Oops!, Something went wrong while retrieving the response. Please try again"
    }

    solutionChatDiv.querySelector(".typing-animation").remove();
    solutionChatDiv.querySelector(".chat-details").appendChild(paragraphElement);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    localStorage.setItem("all-chats",chatContainer.innerHTML);
}

const copyResponse =(copyText)=>{
    const solutionTextElement = copyText.parentElement.querySelector("p");
    navigator.clipboard.writeText(solutionTextElement.textContent)
    copyText.textContent = "done";
    setTimeout(()=>{
        copyText.textContent ="content_copy";
    },1000)
}

const showTypingAnimation =()=>{
    const html =
    `<div class="chat-content">
        <div class="chat-details">
            <img src="./assets/chatgpt.jpg" alt="user-image">
            <div class="typing-animation">
                <div class="typing-dot" style="--delay:0.2s"></div>
                <div class="typing-dot" style="--delay:0.3s"></div>
                <div class="typing-dot" style="--delay:0.4s"></div>
            </div>
        </div>
        <span class="material-symbols-outlined copy-icon" onclick="copyResponse(this)">content_copy</span>
    </div>`
    const solutionChatDiv = createChatElement(html,"solution");
    chatContainer.appendChild(solutionChatDiv);
    chatContainer.scrollTo(0,chatContainer.scrollHeight)
    getPromptResponse(solutionChatDiv);
}

const handlePromptInput=()=>{
    userInput = promptInput.value.trim(); //getting prompt input without extra spaces
    if(!userInput) return;
    promptInput.value = "";
    promptInput.style.height = `${initialHeight}px`
    const html = 
        `<div class="chat-content">
            <div class="chat-details">
                <img src="./assets/user.jpeg" alt="user-image">
                <p></p>
            </div>
        </div>`;
    const promptChatDiv = createChatElement(html,"prompt");
    promptChatDiv.querySelector("p").textContent=userInput;
    document.querySelector(".welcome-text")?.remove();
    chatContainer.appendChild(promptChatDiv);
    chatContainer.scrollTo(0,chatContainer.scrollHeight)
    setTimeout(showTypingAnimation, 500)
}

//dynamic prompt input textarea height
promptInput.addEventListener('input',()=>{
    promptInput.style.height = `${initialHeight}px`;
    promptInput.style.height = `${promptInput.scrollHeight}px`
})

//if enter key without shift and device width greater than 800, it will submit the prompt
promptInput.addEventListener('keydown',(e)=>{
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
        e.preventDefault();
        handlePromptInput();
    }
})

//toggling light theme and dark theme
const toggleTheme = ()=>{
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme",themeButton.innerText)
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" :"light_mode"
}
//theme switching
themeButton.addEventListener('click',toggleTheme);

//sending prompt 
sendButton.addEventListener('click',handlePromptInput);

//deleting chats from local storage
deleteButton.addEventListener('click',()=>{
    if(confirm("Are you sure want to delete this chats?")){
        localStorage.removeItem("all-chats");
        loadFromLocalStorage();
    }
})