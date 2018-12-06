import axios from 'axios';
import {
  GET_USER,
  GET_USER_MODELS,
  SAVE_USER_RESPONSE,
  GET_USER_RESPONSE,
  SAVE_MODEL,
  GET_MODEL,
  DELETE_MODEL,
  RENDER_MODEL,
  GET_MESH,
  RENDER_DAYLIGHTING,
  GET_TEXTURE,
  CHECK_RENDER_STATUS
} from './types';

export const getUser = (token) => {
  return function(dispatch) {
    axios.get('/api/current_user' + "?authToken=" + token).then(res => dispatch({
      type: GET_USER,
      payload: res
    }));
  };
};

export const saveModel = (token, sketchFile, wallFile, modelName) => {
  return function(dispatch) {
    axios.post('/api/sketch/save_model' + "?authToken=" + token, {
      wallFile: wallFile,
      sketchFile: sketchFile,
      modelName: modelName
    }).then(res => dispatch({
      type: SAVE_MODEL,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  };
};

export const getModel = (token, modelId, modelName) => {
  return function(dispatch) {
    axios.post('/api/sketch/get_model' + "?authToken=" + token, {
      modelId: modelId,
      modelName: modelName
    }).then(res => dispatch({
      type: GET_MODEL,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  };
};

export const deleteModel = (token, modelId, modelName) => {
  return function(dispatch) {
    axios.post('/api/sketch/delete_model' + "?authToken=" + token, {
      modelId: modelId,
      modelName: modelName
    }).then(res => dispatch({
      type: DELETE_MODEL,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  };
};
export const deleteSimulation = (token, simulationName, modelName) => {
  return function(dispatch) {
    axios.post('/api/sketch/delete_simulation' + "?authToken=" + token, {
      simName: simulationName,
      modelName: modelName
    }).then(res => dispatch({
      type: DELETE_MODEL,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  };
};

export const getUserModels = (token) => {
  return function(dispatch) {
    axios.post('/api/sketch/get_user_models' + "?authToken=" + token).then(res => dispatch({
      type: GET_MODEL,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  };
};

export const getUserSimulations = (token) => {
  return function(dispatch) {
    axios.post('/api/sketch/get_user_simulations' + "?authToken=" + token).then(res => dispatch({
      type: GET_MODEL,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  };
};

export const renderModel = (token, modelName) => {
  return function(dispatch) {
    axios.post('/api/sketch/get_model_id' + '?authToken=' + token, {
      modelName: modelName
    }).then(res => {
      if (res.data.status === 1) {
        // console.log("pl1", res);
        axios.post('/api/sketch/render_model' + "?authToken=" + token, {
          modelId: res.data.id,
          modelName: modelName
        }).then(res2 => {
          dispatch({
            type: RENDER_MODEL,
            payload: res2
          })
        }).catch(error => {
          console.log(error);
        });
      } else {
        console.log("FIEL", res.data);
      }
    })
  };
};

export const createSimulation = (token, modelName, params) => {
  return function(dispatch) {
    axios.post('/api/sketch/get_model_id' + '?authToken=' + token, {
      modelName: modelName
    }).then(res => {
      if (res.data.status === 1) {
        // console.log("pl1", res);
        axios.post('/api/sketch/create_simulation' + "?authToken=" + token, {
          modelId: res.data.id,
          modelName: modelName,
          params: params
        }).then(res2 => {
          dispatch({
            type: RENDER_MODEL,
            payload: res2
          })
        }).catch(error => {
          console.log(error);
        });
      } else {
        console.log("FIEL", res.data);
      }
    })
  };
};

export const checkRenderStatus = (token, modelName, params) => {
  return function(dispatch) {
    axios.post('/api/sketch/check_render_status' + '?authToken=' + token, {
      modelName: modelName
    }).then(res => dispatch({
      type: CHECK_RENDER_STATUS,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  }
}


export const testAction = (token, modelId, modelName) => {
  return function(dispatch) {
    axios.post('/api/sketch/get_model' + "?authToken=" + token, {
      modelId: modelId,
      modelName: modelName
    }).then(res => dispatch({
      type: GET_MODEL,
      payload: res
    })).catch(error => {
      // console.log(error);
      console.log(error);
    });
  };
};

// confirm model is done remesh
// confirm task is done lsvo




// 5bff2f1303b85875b09bab6b
// export const logIn = () => {
//   return function(dispatch) {
//     axios.get('/api/login').then(res => dispatch({
//       type: LOGIN,
//       payload: res
//     }));
//   };
// };