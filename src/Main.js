import React from "react";
import { HotTable, HotColumn } from "@handsontable/react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import "./Main.scss";
import logo from "./img/logo-front-top-left.png";
import iconMobile from "./img/icon-mobile.png";
import iconDesktop from "./img/icon-desktop.png";
import iconEmail from "./img/icon-email.png";

import {name, nameEng, jobTitle, jobTitleTranslation, mobileCountryCode, mobile, email, address} from "./businessCardProps";

const basicInfos = [name, jobTitle, mobileCountryCode, mobile, email, address];
const entitiesObj = {
  ko:{
    countryName: "Korea",
    entityName: "Bepro Company Co., Ltd.",
    infos: [name, nameEng, jobTitle, mobileCountryCode, mobile, email, address],
    cardSize: {width: 50, height: 90}
  },
  uk:{
    countryName: "UK",
    entityName: "Bepro-UK Ltd.",
    infos: basicInfos,
    cardSize: {width: 55, height: 85}
  },
  de: {
    countryName: "Germany",
    entityName: "Bepro Europe GmbH",
    infos: basicInfos,
    cardSize: {width: 55, height: 85}
  },
  es: {
    countryName: "Spain",
    entityName: "Bepro Spain",
    infos: basicInfos,
    cardSize: {width: 55, height: 85}
  },
  jp: {
    countryName: "Japan",
    entityName: "Bepro Japan LLC",
    infos: [name, nameEng, jobTitle, jobTitleTranslation, mobileCountryCode, mobile, email, address],
    cardSize: {width: 55, height: 91}
  },
  us: {
    countryName: "USA",
    entityName: "Bepro USA Inc.",
    infos: basicInfos,
    cardSize: {width: 50.8, height: 88.9}
  }
}

const frontLogoSize = 10;
const defaultFontSize = 10;

const displayImageWidth = 250;
const downloadImageWidth = displayImageWidth * 10;

class Main extends React.Component{
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();

    this.state = {
      currentEntity: entitiesObj["ko"],
      members:[],
      downloadPreview: false,
      tableSettings: {
        startRows: 200,
        startCols: entitiesObj["ko"].infos.length,
        maxCols: entitiesObj["jp"].infos.length,
        width: "100%",
        rowHeaders: true,
        stretchH: "all",
        manualColumnResize: true
      }
    }
  }

  componentDidMount() {
    let table = this.tableRef.current.hotInstance;
    table.afterPaste = (data, coords) => {
      console.log("hmm?");
    }
  }

  getCertificateInfo = () => {
    const {currentEntity} = this.state;

    let table = this.tableRef.current.hotInstance;
    let rows = table.countRows();
    let members = []

    for(let i=0; i<rows; i++){
      let rowNumber = i+1;
      let memberCardInfo = null;

      currentEntity.infos.map((info, index) => {
        let cellValue = table.getDataAtCell(i,index);
        if(cellValue){
          if(!memberCardInfo) memberCardInfo = {};
          memberCardInfo[info.key] = cellValue
        }
      });

      if(memberCardInfo){
        memberCardInfo.rowNumber = rowNumber;
        memberCardInfo.isPreview = false;
        members.push(memberCardInfo);
      }
    }
    this.setState({members})
  }

  setDownloadPreviewMode = (isPreview) => {
    this.setState({downloadPreview: isPreview})
  }

  setCardPreviewMode = (member, isPreview) => {
    let {members} = this.state;
    let targetIndex = members.indexOf(member);
    members[targetIndex].isPreview = isPreview
    this.setState({members});
  }

  downloadAllImages(){
    let {members} = this.state;
    let zip = new JSZip();

    members.map( (analyst, index) => {

      let imageContainer = document.createElement("div");
      imageContainer.className = "download-image-container"
      imageContainer.style.width = `${downloadImageWidth}px`;

      let targetCardItem = document.getElementById(analyst.code);
      let cloneItem = targetCardItem.cloneNode(true);
      let messageDiv = cloneItem.firstChild;
      cloneItem.removeChild(messageDiv);

      imageContainer.appendChild(cloneItem);

      let rootContainer = document.getElementsByClassName("main")[0];
      rootContainer.appendChild(imageContainer);

      html2canvas(imageContainer, {backgroundColor: null}).then( (canvas) => {
        let dataURL = canvas.toDataURL("image/png");
        let imageURI = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

        zip.file(`row_${analyst.rowNumber}_${analyst.name}_${analyst.code}.png`, imageURI, {base64: true});
        rootContainer.removeChild(imageContainer);

        if(index == members.length - 1){
          zip.generateAsync({type: "blob"}).then( (content) => {
            saveAs(content, "Bepro Business Card.zip");
          })
        }
      });
    })
  }

  downloadImage(member){
    let {currentEntity} = this.state;

    let imageContainer = document.createElement("div");
    imageContainer.className = "download-image-container";
    imageContainer.style.width = `${downloadImageWidth}px`;

    let targetCardItem = document.getElementById(`business-card-${member.rowNumber}`);
    let cloneItem = targetCardItem.cloneNode(true);
    let messageDiv = cloneItem.firstChild;
    cloneItem.removeChild(messageDiv);

    cloneItem.style.fontSize = defaultFontSize * 10 + "pt";

    imageContainer.appendChild(cloneItem);

    let rootContainer = document.getElementsByClassName("main")[0];
    rootContainer.appendChild(imageContainer);

    html2canvas(imageContainer, {backgroundColor: null}).then( (canvas) => {
      let file_path = canvas.toDataURL("image/png");
      let a = document.createElement('a');
      a.href = file_path;
      a.download = `BC_${currentEntity.countryName}_${member.rowNumber}_${member.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      rootContainer.removeChild(imageContainer);
    })
  };

  onEntityButtonClick(entity){
    let newState = {...this.state};

    newState.currentEntity = entity;

    newState.tableSettings.startCols = entity.infos.length;
    newState.tableSettings.maxCols = entity.infos.length;

    this.setState(newState);
  }

  render(){

    let {members, downloadPreview, currentEntity, tableSettings} = this.state;
    console.log(members);
    let {width, height} = currentEntity.cardSize;
    let cardWidth = width;
    let cardHeight = height;

    return  (
      <div className={"main"}>
        <div className={"section-table"}>
          <div className={"section-header"}>
            <div className="title">
              <img src={logo} alt="bepro logo"/><h1>Bepro Business Card Generator</h1>
            </div>

            {/*<div className="guide">*/}
            {/*  <p>1. Put all the information needed for a business card</p>*/}
            {/*  <p>2. Click Generate Business card images button on the bottom</p>*/}
            {/*  <p>3. Check the images generated from the right side.</p>*/}
            {/*  <p>4. Download and bring all the images to the card print site!</p>*/}
            {/*</div>*/}

            <div className="section-select-entity">
              {Object.keys(entitiesObj).map( (countryCode, index) => {
                return (
                  <button className={`btn-entity ${currentEntity === entitiesObj[countryCode] ? 'active' : ''}`}
                          onClick={ () => {this.onEntityButtonClick(entitiesObj[countryCode]);}}>
                    {entitiesObj[countryCode].countryName}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={"section-body"}>
            <div className="table-wrapper">
              <HotTable className="business-card-table"
                        settings={tableSettings}
                        ref={this.tableRef}>
                {currentEntity.infos.map( (info) => {
                  return <HotColumn title={info.displayName}></HotColumn>
                })}
              </HotTable>
            </div>
          </div>
          <button className="button-generate" onClick={() => this.getCertificateInfo()}>Generate Business Card Image to Print</button>
        </div>

        <div className={"section-images"}>
          <div className="section-header">
            <h1>Business Card</h1>
            <h2 className="size-info">{currentEntity.countryName} ( {cardWidth}mm x {cardHeight}mm )</h2>
            <button className={`btn-download-all ${members.length === 0 ? 'disabled' : ''}`}
                    onMouseEnter={() => this.setDownloadPreviewMode(true)}
                    onMouseLeave={() => this.setDownloadPreviewMode(false)}
                    onClick={() => this.downloadAllImages()}
            >{members.length > 0 ? `${members.length}개 ` : ''} Download All Images</button>
          </div>
          <div className="section-body">
            {members.length === 0 && <div className="empty-label">Put all the information in the table and Click Generate Button.<br/> Preview images will be shown here</div>}
            {members.map( (member) => {
              return (
                <div className={`business-card-wrapper`} style={{width: `${displayImageWidth}px`}}>
                  <div className="row-number">{member.rowNumber}</div>
                  <div className={`business-card ${(downloadPreview || member.isPreview) ? 'preview' : ''}`}
                       id={`business-card-${member.rowNumber}`}
                       style={{
                         paddingTop: `${(cardHeight/cardWidth * 100)}%`,
                         fontSize: defaultFontSize + "pt"
                       }}
                  >
                    <div className="message-container">
                      <div className="message preview-guide">
                        <p>Download the image and order business card!</p>
                      </div>
                      <div className="message preview-guide footer">
                        <p>This message won't be included in the download image</p>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="container-logo" style={{width: `${(frontLogoSize/cardWidth) * 100}%`,}}>
                        <div className="logo-front"/>
                      </div>

                      <div className="content-body">
                        <div className="container-name-n-job-title">
                          <div className="info name">
                            <div className="stick"/>
                            <span className="original">{member.name}</span>
                            {member.nameEng && <span className="sub">{member.nameEng}</span>}
                          </div>
                          <div className="info job-title">
                            {member.jobTitle}
                          </div>
                        </div>
                        <div className="container-contact-info">
                          <div className="contact-item mobile">
                            <img src={iconMobile} alt=""/>
                            <span className="country-code">+{member.mobileCountryCode}</span>
                            <span>{member.mobile}</span>
                          </div>
                          <div className="contact-item email">
                            <img src={iconEmail} alt=""/>
                            <span>{member.email}</span>
                          </div>
                          <div className="contact-item mobile">
                            <img src={iconDesktop} alt=""/>
                            <span>www.bepro11.com</span>
                          </div>
                        </div>
                        <div className="container-address">
                          <div className="address-header">{currentEntity.entityName}</div>
                          <div className="address-body">{member.address}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="btn-download-image"
                          onMouseEnter={() => this.setCardPreviewMode(member, true)}
                          onMouseLeave={() => this.setCardPreviewMode(member, false)}
                          onClick={() => this.downloadImage(member)}
                  >Download Individual Image</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

}

export default Main
