import { Component, Fragment } from 'react';
import AuthPage from './AuthPage'
import HomePage from './HomePage';
import AlbumsPage from './AlbumsPage';
import PhotosPage from './PhotosPage';
import AccountPage from './AccountPage';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      isLoggedIn: false,
      appUserID: 0,
      albums: [],
      showError: false,
      errorMsg: "",
      isUnknownError: true,
      userErrorDescription: "",
      showAuthModal: false,
      showAccountModal: false,
      pageToShow: "home",
      logOutRequired: false,
      isRegistering: false,
      navExpanded: false,
    }
  }

  setLoggedIn = async (userID, token) => {
    localStorage.setItem('token', token);
    this.setState({
      appUserID: userID,
      isLoggedIn: true,
      showAuthModal: false,
    })
  }

  setLoggedOut = async () => {
    localStorage.removeItem('token');
    this.setState({
      appUserID: 0,
      isLoggedIn: false,
      albums: [],
      pageToShow: "home",
      showAuthModal: false,
      showError: false,
      errorMsg: "",
      isUnknownError: true,
      userErrorDescription: "",
      logOutRequired: false,
      isRegistering: false,
    })
  }

  showLoginPage = async () => {
    this.setState({ isRegistering: false }, () => {
      this.setState({
        showAuthModal: true
      })
    })
  }

  showRegisterPage = async () => {
    this.setState({ isRegistering: true }, () => {
      this.setState({
        showAuthModal: true
      })
    })
  }

  closeAuthPage = async () => {
    this.setState({ isRegistering: false }, () => {
      this.setState({
        showAuthModal: false
      })
    })
  }

  closeAccountModal = async () => {
    this.setState({
      showAccountModal: false,
    })
  }

  showPage = async (page) => {
    this.setState({ pageToShow: page })
  }

  getAlbums = async () => {
    const token = localStorage.getItem('token');
    await fetch("/api/album/user/" + encodeURIComponent(this.state.appUserID), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }).then(async (resp) => {
      if (resp.status !== 200) {
        let errorMsg = await resp.text();
        this.displayError(errorMsg, true);
      } else {
        let respJSON = await resp.json();
        this.setState({ albums: [] }, async () => {
          for (let i = 0; i < respJSON.length; i++) {
            let albums = this.state.albums
            let albumPhotos = await this.getAlbumPhotos(respJSON[i].id);
            let url = "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg"
            if (albumPhotos.length > 0) {
              url = await this.getPhotoURL(albumPhotos[0].photo_id)
            }
            var obj = respJSON[i];
            obj.photo_url = url
            albums.push(obj)
            this.setState({ albums: albums })
          }
        })
      }
    })
  }

  getAlbumPhotos = async (albumID) => {
    const token = localStorage.getItem('token');
    return await fetch("/api/album_photo/album/" + encodeURIComponent(albumID), {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    }).then(async (resp) => {
      let albumPhotos = []
      if (resp.status === 200) {
        albumPhotos = await resp.json();
      }
      return albumPhotos
    });
  }

  getPhotoURL = async (photoID) => {
    const token = localStorage.getItem('token');
    return await fetch("/api/photo/id/" + encodeURIComponent(photoID), {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    }).then(async (resp) => {
      let url = "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg"
      if (resp.status === 200) {
        url = await resp.json();
      }
      return url
    });
  }

  displayError = (msg, isUnknown) => {
    let msgStr = String(msg).trim()
    if (msgStr === "signature is invalid") { // token is no longer valid, force logout
      this.setState({ logOutRequired: true })
      msgStr = "Session expired, please sign in"
      isUnknown = false
    }
    if (msgStr.includes("<html>") || !msgStr) { // error response from backend contains html and shouldn't be displayed, likely a server timeout or no msg occured
      msgStr = "Uknown error occured"
      isUnknown = false
    }
    this.setState({ errorMsg: msgStr, showError: true, isUnknownError: isUnknown })
  }

  closeError = () => {
    if (this.state.logOutRequired) {
      this.setLoggedOut()
      return
    }
    this.setState({
      showError: false,
      errorMsg: "",
      isUnknownError: true,
      userErrorDescription: ""
    })
  }

  handleUserErrorDescriptionChange = (e) => {
    this.setState({ userErrorDescription: e.target.value })
  }

  reportError = async () => {
    const token = localStorage.getItem('token');
    let errorData = {
      error_message: this.state.errorMsg,
      user_description: this.state.userErrorDescription,
      app_user_id: this.state.appUserID,
    }
    await fetch("/api/error_event/", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(errorData)
    }).finally(() => {
      this.closeError()
    });
  }

  setNavExpanded = (expanded) => {
    console.log("expanded?", expanded)
    this.setState({ navExpanded: expanded });
  }

  closeNav = (eventKey, syntheticEvent) => {
    console.log(eventKey)
    console.log(syntheticEvent)
    console.log("closing nav")
    this.setState({ navExpanded: false });
  }

  render() {
    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    window.addEventListener('resize', () => {
      let vw = window.innerWidth * 0.01;
      document.documentElement.style.setProperty('--vw', `${vw}px`);
    });
    return (
      <div className="App">
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
          <Container>
            <Navbar.Brand
              onClick={() => this.showPage("home")}
            >Definitely Not PB</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                {this.state.isLoggedIn ?
                  <Fragment>
                    <Nav.Link
                      onClick={(e) => this.showPage("albums")}
                    >View Albums</Nav.Link>
                    <Nav.Link
                      onClick={() => this.showPage("photos")}
                    >Manage Photos</Nav.Link>
                  </Fragment>
                  :
                  null
                }
              </Nav>
              <Nav>
                {this.state.isLoggedIn ?
                  <Fragment>
                    <Nav.Link
                      onClick={() => this.setState({ showAccountModal: true })}
                    >Account</Nav.Link>
                    <Nav.Link
                      onClick={this.setLoggedOut}
                    >Logout</Nav.Link>
                  </Fragment>
                  :
                  <Fragment>
                    <Nav.Link
                      onClick={this.showLoginPage}
                    >Login</Nav.Link>
                    <Nav.Link
                      onClick={this.showRegisterPage}
                    >Register</Nav.Link>
                  </Fragment>
                }
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {this.state.pageToShow === "home" ?
          <HomePage
            appUserID={this.state.appUserID}
            displayError={this.displayError}
          />
          :
          null
        }
        {this.state.pageToShow === "albums" ?
          <AlbumsPage
            appUserID={this.state.appUserID}
            albums={this.state.albums}
            getAlbums={this.getAlbums}
            displayError={this.displayError}
          />
          :
          null
        }
        {this.state.pageToShow === "photos" ?
          <PhotosPage
            appUserID={this.state.appUserID}
            albums={this.state.albums}
            getAlbums={this.getAlbums}
            displayError={this.displayError}
          />
          :
          null
        }
        {this.state.showAuthModal ?
          <Modal
            show={true}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
          >
            <Modal.Body>
              <AuthPage
                isLoggedIn={this.state.isLoggedIn}
                setLoggedIn={this.setLoggedIn}
                setLoggedOut={this.setLoggedOut}
                displayError={this.displayError}
                isRegistering={this.state.isRegistering}
                closeAuthPage={this.closeAuthPage}
                showLoginPage={this.showLoginPage}
              />
            </Modal.Body>
          </Modal>
          :
          null
        }
        {this.state.showAccountModal ?
          <Modal
            show={true}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
          >
            <Modal.Body>
              <AccountPage
                appUserID={this.state.appUserID}
                closeAccountModal={this.closeAccountModal}
                displayError={this.displayError}
              />
            </Modal.Body>
          </Modal>
          :
          null
        }
        {this.state.showError ?
          <Modal
            show={true}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
            className="error-modal"
          >
            <Modal.Header>
              <Modal.Title>An error has occured</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.state.errorMsg}
              <br />
              <br />
              {this.state.isUnknownError ?
                <Fragment>
                  <Form.Label
                    className="upload-form-label upload-form-description-label"
                  >Description of what you were doing when the error occured:</Form.Label>
                  <Form.Control
                    as="textarea"
                    required={true}
                    onChange={(e) => this.handleUserErrorDescriptionChange(e)}
                    value={this.state.userErrorDescription}
                  />
                </Fragment>
                :
                null
              }
            </Modal.Body>
            <Modal.Footer>
              {this.state.isUnknownError ?
                <Fragment>
                  <Button variant="success" type="submit" onClick={this.reportError}>Report Error</Button>
                  <Button variant="primary" onClick={this.closeError}>Continue Without Reporting</Button>
                </Fragment>
                :
                <Button variant="primary" onClick={this.closeError}>Ok</Button>
              }
            </Modal.Footer>
          </Modal>
          :
          null
        }
      </div>
    );
  }
}

export default App;
