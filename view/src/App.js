import { Component } from 'react';
import AuthPage from './AuthPage'
import HomePage from './HomePage';
import AlbumsPage from './AlbumsPage';
import PhotosPage from './PhotosPage';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      isLoggedIn: false,
      showAlbumsPage: false,
      showPhotosPage: false,
      appUserID: 0,
      albums: [],
      showError: false,
      errorMsg: "",
    }
  }

  setLoggedIn = async (userID) => {
    this.setState({ appUserID: userID, isLoggedIn: true })
  }

  setLoggedOut = async () => {
    this.setState({
      appUserID: 0,
      isLoggedIn: false,
      albums: [],
      showAlbumsPage: false,
      showPhotosPage: false,
    })
  }

  showAlbumsPage = async () => {
    this.setState({ showAlbumsPage: true })
  }

  showPhotosPage = async () => {
    this.setState({ showPhotosPage: true })
  }

  goBackToHomePage = async () => {
    this.setState({ showAlbumsPage: false, showPhotosPage: false })
  }

  getAlbums = async () => {
    await fetch("/api/album/user/" + encodeURIComponent(this.state.appUserID), {
      method: "GET",
      headers: {
        "content-type": "application/json",
      }
    }).then(async (resp) => {
      if (resp.status !== 200) {
        console.error("bad response code: ", resp.status)
      } else {
        let respJSON = await resp.json();
        this.setState({ albums: respJSON })
      }
    })
  }

  displayError = (msg) => {
    this.setState({ errorMsg: msg, showError: true })
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
        {this.state.isLoggedIn && !this.state.showAlbumsPage && !this.state.showPhotosPage ?
          <HomePage
            appUserID={this.state.appUserID}
            showAlbumsPage={this.showAlbumsPage}
            showPhotosPage={this.showPhotosPage}
            displayError={this.displayError}
          />
          :
          null
        }
        {!this.state.isLoggedIn ?
          <AuthPage
            isLoggedIn={this.state.isLoggedIn}
            setLoggedIn={this.setLoggedIn}
            displayError={this.displayError}
          />
          :
          null
        }
        {this.state.showAlbumsPage ?
          <AlbumsPage
            appUserID={this.state.appUserID}
            goBackToHomePage={this.goBackToHomePage}
            albums={this.state.albums}
            getAlbums={this.getAlbums}
            logOut={this.setLoggedOut}
            displayError={this.displayError}
          />
          :
          null
        }
        {this.state.showPhotosPage ?
          <PhotosPage
            appUserID={this.state.appUserID}
            goBackToHomePage={this.goBackToHomePage}
            albums={this.state.albums}
            logOut={this.setLoggedOut}
            getAlbums={this.getAlbums}
            displayError={this.displayError}
          />
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
          >
            <Modal.Header>
              <Modal.Title>An error has occured</Modal.Title>
            </Modal.Header>
            <Modal.Body>{this.state.errorMsg}</Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={() => this.setState({ showError: false, errorMsg: "" })}>Ok</Button>
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
