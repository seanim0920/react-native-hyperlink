//taken from https://github.com/maherzaidoune/react-native-url-preview

import React from 'react';
import {getLinkPreview} from 'link-preview-js';
import PropTypes from 'prop-types';
import {Image, Linking, Platform, Text, TouchableOpacity, View, ViewPropTypes} from 'react-native';

export default class RNUrlPreview extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      linkTitle: undefined,
      linkDesc: undefined,
      linkFavicon: undefined,
      linkImg: undefined,
    };
    this.getPreview(props.url, props.requestOptions);
  }

  getPreview = (url, options) => {
    const {onError, onLoad} = this.props;
    getLinkPreview(url, options)
      .then(data => {
        onLoad(data);
        this.setState({
          linkTitle: data.title ? data.title : undefined,
          linkDesc: data.description ? data.description : undefined,
          linkImg:
            data.images && data.images.length > 0
              ? data.images.find(function(element) {
                  return element.includes('.png') || element.includes('.jpg') || element.includes('.jpeg');
                })
              : undefined,
          linkFavicon: data.favicons && data.favicons.length > 0 ? data.favicons[data.favicons.length - 1] : undefined,
        });
      })
      .catch(error => {
        onError(error);
      });
  };

  componentDidUpdate(nextProps) {
    if (nextProps.url !== this.props.url) {
      this.getPreview(nextProps.url);
    }
  }

  _onLinkPressed = () => {
    this.props.onPress ?? Linking.openURL(this.props.url);
  };

  renderImage = (imageLink, faviconLink, imageStyle, faviconStyle, imageProps) => {
    return imageLink ? (
      <Image style={imageStyle} source={{uri: imageLink}} {...imageProps} />
    ) : faviconLink ? (
      <Image style={faviconStyle} source={{uri: faviconLink}} {...imageProps} />
    ) : null;
  };
  renderText = (showTitle, showDescription, title, description, textContainerStyle, titleStyle, descriptionStyle, titleNumberOfLines, descriptionNumberOfLines) => {
    return (
      <View style={textContainerStyle}>
        {showTitle && (
          <Text numberOfLines={titleNumberOfLines} style={titleStyle}>
            {title}
          </Text>
        )}
        {showDescription && (
          <Text numberOfLines={descriptionNumberOfLines} style={descriptionStyle}>
            {description}
          </Text>
        )}
      </View>
    );
  };
  renderLinkPreview = (
    containerStyle,
    imageLink,
    faviconLink,
    imageStyle,
    faviconStyle,
    showTitle,
    showDescription,
    title,
    description,
    textContainerStyle,
    titleStyle,
    descriptionStyle,
    titleNumberOfLines,
    descriptionNumberOfLines,
    imageProps,
  ) => {
    return (
      <TouchableOpacity style={[styles.containerStyle, containerStyle]} activeOpacity={0.9} onPress={() => this._onLinkPressed()}>
        {this.renderImage(imageLink, faviconLink, imageStyle, faviconStyle, imageProps)}
        {this.renderText(showTitle, showDescription, title, description, textContainerStyle, titleStyle, descriptionStyle, titleNumberOfLines, descriptionNumberOfLines)}
      </TouchableOpacity>
    );
  };

  render() {
    const {
      text,
      containerStyle,
      imageStyle,
      faviconStyle,
      textContainerStyle,
      title,
      description,
      titleStyle,
      titleNumberOfLines,
      descriptionStyle,
      descriptionNumberOfLines,
      imageProps,
    } = this.props;
    return this.renderLinkPreview(
          containerStyle,
          this.state.linkImg,
          this.state.linkFavicon,
          imageStyle,
          faviconStyle,
          title,
          description,
          this.state.linkTitle,
          this.state.linkDesc,
          textContainerStyle,
          titleStyle,
          descriptionStyle,
          titleNumberOfLines,
          descriptionNumberOfLines,
          imageProps,
        )
  }
}

const styles = {
  containerStyle: {
    flexDirection: 'row',
  },
};

RNUrlPreview.defaultProps = {
  onLoad: () => {},
  onError: () => {},
  url: null,
  requestOptions: {},
  containerStyle: {
    backgroundColor: 'rgba(239, 239, 244,0.62)',
    alignItems: 'center',
  },
  imageStyle: {
    width: Platform.isPad ? 160 : 110,
    height: Platform.isPad ? 160 : 110,
    paddingRight: 10,
    paddingLeft: 10,
  },
  faviconStyle: {
    width: 40,
    height: 40,
    paddingRight: 10,
    paddingLeft: 10,
  },
  textContainerStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
  },
  title: true,
  description: true,
  titleStyle: {
    fontSize: 17,
    color: '#000',
    marginRight: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  titleNumberOfLines: 2,
  descriptionStyle: {
    fontSize: 14,
    color: '#81848A',
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  descriptionNumberOfLines: Platform.isPad ? 4 : 3,
  imageProps: {resizeMode: 'contain'},
};

RNUrlPreview.propTypes = {
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  url: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  imageStyle: ViewPropTypes.style,
  faviconStyle: ViewPropTypes.style,
  textContainerStyle: ViewPropTypes.style,
  title: PropTypes.bool,
  description: PropTypes.bool,
  titleStyle: Text.propTypes.style,
  titleNumberOfLines: Text.propTypes.numberOfLines,
  descriptionStyle: Text.propTypes.style,
  descriptionNumberOfLines: Text.propTypes.numberOfLines,
  requestOptions: PropTypes.shape({
    headers: PropTypes.objectOf(PropTypes.string),
    imagesPropertyType: PropTypes.string,
    proxyUrl: PropTypes.string 
  })
};