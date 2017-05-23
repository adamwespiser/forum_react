
import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'
import { FormGroup,InputGroup,Form,PageHeader,Button,Grid,Col,Row,Panel,FormControl,Alert,Jumbotron,HelpBlock } from 'react-bootstrap';

////////////////////////////////////////////////////////////
// 1. Click the public page
// 2. Click the protected page
// 3. Log in
// 4. Click the back button, note the URL each time


const baseUrl = 'http://localhost:8080/posts'

export const loadPosts = () => {
  return fetch(baseUrl)
    .then(res => res.json())
}

export const createPosts = (post) => {
  return fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
  })

}



const fakeAuth = {
  isAuthenticated: false,
  userName: '',
  id: 0,
  authenticate(cb,name) {
    this.userName = name
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
    localStorage.setItem("userName",name)
    console.log("fake authenticated")
    console.log(this.userName)
  },
  signout(cb) {
    this.isAuthenticated = false
    localStorage.removeItem("userName")
    setTimeout(cb, 100)
  }
}


const jumbotronInstance = (
  <div>
  <Panel header="Welcome!">
    <ul>
      <li>This is a simple forum for you to play with, pls enjoy, for the lulz.</li>
      <li>Write whatever you want, within reason.</li>
      <li>Think of third bullet point.</li>
    </ul>

      </Panel>
  </div>
);

const PostField = (props) => {
    var elems;
    if (props.posts) {
      elems = props.posts.map(post =>
        <Post key={post.id} user={post.userName} {...post}/>)
    } else {
      elems = <Post key={0} user={fakeAuth.userName} text={"hello"}/>
    }
    return(
      <Panel className="postfield">
        {elems}
      </Panel>
    )}


class Post extends React.Component {
  render(){
    return(
        <Panel key={this.props.id} header={this.props.user}>
          {this.props.text}
        </Panel>)}}

const notEmpty = (msg,att) => {
  if(att === 0){
    return null;
  }
  else if (msg.length === 0){
    return 'error';
  } else {
    return 'success'
  }
}

const CreateMsg = (props) => {
  //  <FormGroup validationState={notEmpty(props.msgTarget)}>
  return(
    <FormGroup validationState={notEmpty(props.msgTarget,props.attempt)}>
      <InputGroup>
        <InputGroup.Button>
          <Button onClick={props.handleSubmit}>Post</Button>
        </InputGroup.Button>
        <FormControl type="textarea"
               onChange={props.msgBox}
               value={props.msgTarget} />
      </InputGroup>
      <FormControl.Feedback />
      {(notEmpty(props.msgTarget,props.attempt) === 'error') ?
      <HelpBlock>Please provide a postive length msg!</HelpBlock>
      : (<div></div>) }
    </FormGroup>
)}

export const RandomNum = () => {return(Math.floor((Math.random()*100000) + 1));}


class Forum extends React.Component {
  state = {
    userName: '',
    msgTarget:'',
    posts: [
      {id: 0, userName: "Adam", text: "Hello World!!!!"},
      {id: 1, userName: "Adam", text: "So Long, Good to know ya"},
      {id: 2, userName: "Steve", text: "a man a plan, a canal panama"},
      {id: 3, userName: "Jim", text: "land rover over land actual"},
      {id: 4, userName: "Bobby", text: "aude lang sung"},
      {id: 5, userName: "Jonny", text: "what?"},
      {id: 7, userName: "Saul", text: "its all good man"}
    ],
    submitAttempt: 0,
  }
  componentWillMount = () => {

    loadPosts().then(posts => this.setState({posts: posts,userName: fakeAuth.userName}))

  }
  handleMsgBox = (evt) => {
    evt.preventDefault();
    this.setState({msgTarget: evt.target.value,submitAttempt:1})
  }
  newMsg = () => {
    if (this.state.msgTarget.length > 0){
      const newPost = {id: RandomNum(), userName: this.state.userName, text: this.state.msgTarget }
      this.setState({posts: [newPost, ...this.state.posts], msgTarget:'',submitAttempt:0})
      createPosts(newPost).then(()=>{})
    }
  }
  render(){
    return (
      <div>
        <CreateMsg userName={this.state.userName}
                   msgBox={this.handleMsgBox}
                   handleSubmit={this.newMsg}
                   msgTarget={this.state.msgTarget}
                   attempt={this.state.submitAttempt}/>
        <PostField posts={this.state.posts}/>
      </div>
    )
  }
}

const Public = () => jumbotronInstance

class Login extends React.Component {
  state = {
    redirectToReferrer: false,
    inputText: '',
    errorMsg:'',
    errorEntry:false
  }
  cleanInput = () => {
     console.log("clean");
    if (this.state.inputText.length > 0) {
      this.login()
    } else {
      this.setState({errorMsg: "name must have at least 1 chars ",
                    errorEntry: true})
    }
  }
  login = () => {
    //
    console.log("login sent to fakeAuth")
    console.log(this.state.inputText)
    fakeAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true,
                      userName: this.state.inputText})
    }, this.state.inputText)
  }
  setText = (e) => {
    this.setState({inputText: e.target.value})
  }
  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } }
    const { redirectToReferrer } = this.state

    if (redirectToReferrer) {
      console.log(this.state.inputText.concat("redirect"))
      return (
        <Redirect to={from}/>
      )
    }


    // Create msg to equal pathname user tries to navigate to
    var msg = (<div></div>)
    var myPath = from.pathname

    if (from.pathname !== '/'){
      msg = (<Alert bsStyle="warning">Cannot navigate to <strong>{myPath.substring(1)} </strong> w/o a log in!</Alert>)
    }


    //not logged in but cookie(localStorage.userName) found, re log in
    if (fakeAuth.isAuthenticated === false && localStorage.userName){
      fakeAuth.authenticate(() => {}, localStorage.userName)
    }
    return (
      fakeAuth.isAuthenticated ?
      <Panel>

      <AuthButton />
      </Panel>
      :
      <Panel header="Log In">
        <FormGroup>
          <InputGroup>
            <InputGroup.Button>
              <Button onClick={this.cleanInput}>Submit</Button>
            </InputGroup.Button>
            <FormControl  type="text"
                          onChange={this.setText}
                          value={this.state.inputText} />
            </InputGroup>
        </FormGroup>
        {this.state.errorEntry ?
          (<Alert bsStyle="danger">{this.state.errorMsg}</Alert>) : msg}
      </Panel>
    )
  }
}



class App extends React.Component {
  state = {
    isAuthenticated: false,
    userName: '',
    id: 0
  }

  render = () => {
    return (
      <Router>
        <div>
          <PageHeader><small>lulz</small></PageHeader>
          <Grid>

            <Row className="show-grid">
              <Col xs={1} md={1} lg={1}>
                <div>
                  <Link to="/about">About</Link><br />
                  <Link to="/login">Login</Link><br />
                  <Link to="/forum">Forum</Link><br />
                </div>
              </Col>
              <Col xs={6} md={7} lg={8}>
                <Route exact path="/" component={Public}/>
                <Route path="/about" component={Public}/>
                <Route path="/login" component={Login}/>
                <PrivateRoute path="/forum" component={Forum}/>
              </Col>
            </Row>
          </Grid>
        </div>
      </Router>
    )
  }
}



const AuthButton = withRouter(({ history, isAuthenticated, signout }) => (
  fakeAuth.isAuthenticated ? (
    <p>
      <Button bsSize="small" onClick={() => {
        fakeAuth.signout(() => history.push('/'))
      }}>Sign out as {fakeAuth.userName}</Button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  )))



const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    fakeAuth.isAuthenticated ? (
      <div>
      <Component {...props}/>
      </div>

    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)


export default App
