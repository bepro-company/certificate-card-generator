import React from "react";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import "./Main.scss"

class Main extends React.Component{

  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.settings = {
      startRows: 200,
      startCols: 3,
      width: "100%",
      rowHeaders: true,
      stretchH: "all",
      colWidths: ["33.33%", "33.33%", "33.33%"],
      maxCols: 3
    }
    this.state = {
      analysts:[],
      downloadPreview: false,
    }
  }

  componentDidMount() {
    let table = this.tableRef.current.hotInstance;
    table.afterPaste = (data, coords) => {
      console.log("hmm?");
    }
  }

  getCertificateInfo = () => {
    let table = this.tableRef.current.hotInstance;
    let rows = table.countRows();

    let analysts = []
    for(let i=0; i<rows; i++){
      let rowNumber = i+1;
      let code = table.getDataAtCell(i,0);
      let name = table.getDataAtCell(i,1);
      let period = table.getDataAtCell(i,2);
      let grade = (code && (code[0] == "A" || code[0] == "B")) ? code[0] : "";
      let isPreview = false;

      if(code || name || period){
        let analyst = {rowNumber, grade, code, name, period, isPreview}
        analysts.push(analyst);
      }
    }
    this.setState({analysts})
  }

  setDownloadPreviewMode = (isPreview) => {
    this.setState({downloadPreview: isPreview})
  }

  setCardPreviewMode = (analyst, isPreview) => {
    let {analysts} = this.state;
    let targetIndex = analysts.indexOf(analyst);
    analysts[targetIndex].isPreview = isPreview
    this.setState({analysts});
  }

  downloadAllImages(){
    let {analysts} = this.state;
    let zip = new JSZip();

    analysts.map( (analyst, index) => {

      let imageContainer = document.createElement("div");
      imageContainer.className = "download-image-container"

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

        if(index == analysts.length - 1){
          zip.generateAsync({type: "blob"}).then( (content) => {
            saveAs(content, "Bepro Analysts.zip");
          })
        }
      });
    })
  }

  downloadImage(analyst){
    let imageContainer = document.createElement("div");
    imageContainer.className = "download-image-container"

    let targetCardItem = document.getElementById(analyst.code);
    let cloneItem = targetCardItem.cloneNode(true);
    let messageDiv = cloneItem.firstChild;
    cloneItem.removeChild(messageDiv);

    imageContainer.appendChild(cloneItem);

    let rootContainer = document.getElementsByClassName("main")[0];
    rootContainer.appendChild(imageContainer);

    html2canvas(imageContainer, {backgroundColor: null}).then( (canvas) => {
      let file_path = canvas.toDataURL("image/png");
      let a = document.createElement('a');
      a.href = file_path;
      a.download = `row_${analyst.rowNumber}_${analyst.name}_${analyst.code}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      rootContainer.removeChild(imageContainer);
    })
  };


  render(){

    let {analysts, downloadPreview} = this.state;

    return  (
      <div className={"main"}>
        <div className={"section-table"}>
          <div className={"section-header"}>
            <h1>Bepro11 Analyst 자격증 제작 툴</h1>
            <div className="guide">
              <p>1. 컬럼 A,B,C에 각각 자격번호, 이름, 유효기간을 입력합니다.</p>
              <p>2. 맨 아래 이미지 생성 버튼을 클릭합니다</p>
              <p>3. 우측에 완성 예상 이미지들을 보고 오탈자가 있는지 확인합니다.</p>
              <p>4. 이미지를 모두 다운로드 하여 인쇄업체에 전달합니다.</p>
            </div>
          </div>

          <div className={"section-body"}>
            <div className={"custom-column-header"}>
              <div className="row-fixed"></div>
              <div className="col code">자격 번호</div>
              <div className="col name">이름</div>
              <div className="col period">유효기간</div>
            </div>
            <div className="table-wrapper">
              <HotTable className="certificate-table" settings={this.settings} ref={this.tableRef}/>
            </div>
          </div>
          <button className="button-generate" onClick={() => this.getCertificateInfo()}>합격증에 새길 합격자 정보 이미지 생성</button>
        </div>
        <div className={"section-images"}>
          <div className="section-header">
            <h1>합격자 정보 이미지 영역</h1>
            <button className={`btn-download-all ${analysts.length === 0 ? 'disabled' : ''}`}
                    onMouseEnter={() => this.setDownloadPreviewMode(true)}
                    onMouseLeave={() => this.setDownloadPreviewMode(false)}
                    onClick={() => this.downloadAllImages()}
            >{analysts.length > 0 ? `${analysts.length}개 ` : ''} 이미지 일괄 다운로드</button>
          </div>
          <div className="section-body">
            {analysts.length === 0 && <div className="empty-label">테이블에 정보를 넣고 이미지 생성버튼을 누르시면 이곳에 완성 예상 이미지가 나타납니다</div>}
            {analysts.map( (analyst, index) => {

              return (
                <div className={`certificate-card-wrapper`}>
                  <div className="row-number">{analyst.rowNumber}</div>
                  <div className={`certificate-card ${analyst.grade} ${(downloadPreview || analyst.isPreview) ? 'preview' : ''}`} id={`${analyst.code}`}>
                    <div className="message-container">
                      <div className="message preview-guide">
                        <p>인쇄 업체에는 합격자 정보만 전달합니다.</p>
                        <p>이미지를 다운받아 업체에 전달해주세요.</p>
                      </div>
                      {!analyst.grade && (
                        <div className="message grade-alert">
                          <p>자격 등급을 알 수 없습니다.</p>
                          <p>자격 번호를 확인해주세요</p>
                        </div>
                      )}
                      <div className="message preview-guide footer">
                        <p>이 메세지는 이미지에서 제외됩니다</p>
                      </div>
                    </div>

                    <div className="info">
                      <p>{analyst.name}</p>
                      <p>{analyst.code}</p>
                      <p>{analyst.period}</p>
                    </div>
                  </div>
                  <button className="btn-download-image"
                          onMouseEnter={() => this.setCardPreviewMode(analyst, true)}
                          onMouseLeave={() => this.setCardPreviewMode(analyst, false)}
                          onClick={() => this.downloadImage(analyst)}
                  >개별 이미지 다운로드</button>
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