/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image
} from "react-native";
import RNIosInstaShare from "react-native-ios-insta-share";
import RNFetchBlob from "rn-fetch-blob";

var RNFS = require("react-native-fs");

type Props = {};
export default class App extends Component<Props> {
  getFileName(name: string) {
    const FULLPATH =
      Platform.OS === "ios"
        ? RNFS.DocumentDirectoryPath + "/" + name + ".ig"
        : "file://" + RNFS.ExternalStorageDirectoryPath + "/" + name + ".jpg";
    return FULLPATH;
    // return (
    //   FILE +
    //   RNFS.DocumentDirectoryPath +
    //   "/" +
    //   name +
    //   ".jpg"  +
    // "Image.ig"
    // );
  }

  deleteFile(path: string) {
    return (
      RNFS.unlink(path)
        .then(() => {
          console.log("FILE DELETED");
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log(err.message);
        })
    );
  }

  // This is for android, it downloads the image and stores it in the External Storage Directory
  // then calls the method createPost(social sharing) method from the native module.
  // We can set the name to just be the same all the time, so there is only ever one file.
  downloadAndGetImageUrl(name: string, source_url: string) {
    let fileName = this.getFileName(name);
    this.deleteFile(fileName);
    return RNFS.exists(fileName)
      .then(response => {
        if (response) {
          console.log("reponse is true");
          return { uri: fileName };
        } else {
          const FULLPATH =
            Platform.OS === "ios"
              ? RNFS.DocumentDirectoryPath + "/" + name + ".ig"
              : RNFS.ExternalStorageDirectoryPath + "/" + name + ".jpg";
          console.log("response is false");
          return RNFS.downloadFile({
            fromUrl: source_url,
            toFile: FULLPATH
          })
            .promise.then(response => {
              RNIosInstaShare.createPost(
                FULLPATH,
                res => {
                  console.log(res);
                  this.directoryList();
                } // callback function return result `true` if user have instagram app and can create post
              );
              return { uri: fileName };
            })
            .catch(error => {
              return { uri: source_url };
            });
        }
      })
      .catch(error => {
        return { uri: source_url };
      });
  }

  iosShare(source_url: string) {
    RNIosInstaShare.createPost(
      source_url,
      res => {
        console.log(res);
      } // callback function return result `true` if user have instagram app and can create post
    );
  }

  // urlToBase64(source_url: string) {
  //   RNFetchBlob.config({ fileCache: false })
  //     .fetch("GET", source_url)
  //     .then(resp => {
  //       return resp.readFile("base64").then(base64 => {
  //         return { resp, base64 };
  //       });
  //     })
  //     .then(obj => {
  //       var headers = obj.resp.respInfo.headers;
  //       var type = headers["Content-Type"];
  //       var dataUrl = "data:" + type + ";base64," + obj.base64;
  //       RNIosInstaShare.createPost(
  //         dataUrl,
  //         res => {
  //           this.directoryList();
  //           console.log("here: " + dataUrl);
  //         } // callback function return result `true` if user have instagram app and can create post
  //       );
  //       return { url: dataUrl };
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // }

  // Use this to check which files are in the Document Directory, for android we are using this one
  // I believe: RNFS.readDir(RNFS.ExternalStorageDirectoryPath)
  directoryList() {
    RNFS.readDir(RNFS.DocumentDirectoryPath)
      .then(result => {
        console.log("GOT RESULT", result);

        // stat the first file
        return Promise.all([RNFS.stat(result[0].path), result[0].path]);
      })
      .then(statResult => {
        if (statResult[0].isFile()) {
          // if we have a file, read it
          return RNFS.readFile(statResult[1], "utf8");
        }

        return "no file";
      })
      .then(contents => {
        // log the file contents
        console.log(contents);
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            RNIosInstaShare.createPost(
              REACT_ICON_STRING,
              // googleImage,
              // src="https://dbl4hsd8tfgwq.cloudfront.net/telusproduction/5a73be5f2d6d2_i_480x688.jpg"
              // {
              //   url: REACT_ICON_STRING
              // }, // `url` is global link for iOS and uri for Android e.g.: `file://..`

              res => {
                console.log(res);
              } // callback function return result `true` if user have instagram app and can create post
            );
          }}
        >
          <View style={styles.instructions}>
            <Image source={require("./images/reactjs.jpg")} />
            <Text>Share to instagram</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // this.urlToBase64(
            //   "http://www.knowahead.in/wp-content/uploads/2012/04/google-plus-vanity-URL.jpg"
            // );
            this.downloadAndGetImageUrl(
              "sharedImageEight",
              "https://dbl4hsd8tfgwq.cloudfront.net/telusproduction/5a73be5f2d6d2_i_480x688.jpg"
            );
          }}
        >
          <View style={styles.instructions}>
            <Text>Download photo</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});

const REACT_ICON_STRING = "./images/reactjs.jpg";
const googleImage =
  "http://blog.rankwatch.com/wp-content/uploads/2014/08/WebSearch_link_Building.jpg";
const GOOGLE_ICON =
  "data:image/png;base64,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";
const REACT_ICON =
  "data:image/png;base64,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";
