import './App.css';
import Home from './pages/Home';
import ModelDetails from './pages/ModelDetails';
import Upload from './pages/UploadModel'
import BuyModel from './pages/BuyModel'
import ModelGallery from './pages/ModelGallery'

function App() {
  return (
    <div className="App">
      <Home />
      <ModelDetails />
      <Upload />
      <BuyModel />
      <ModelGallery />
    </div>
  );
}

export default App;
