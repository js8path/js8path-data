/*
example data for js8path-data
example-data.js
*/

let receptionReportList = [
  {
    timestamp: "2019-06-03T20:31:15Z",
    freqHz: 7079110,
    sNR: -13,
    rxCall: "SM6FMB",
    rxGrid: "JO57vo28",
    txCall: "OH8STN",
    txGrid: "KP25QC92LD",
    srcType: "PSKReporter",
    srcData: {
      receiverCallsign: "SM6FMB",
      receiverLocator: "JO57vo28",
      senderCallsign: "OH8STN",
      senderLocator: "KP25QC92LD",
      frequencyHz: 7079110,
      flowStartSeconds: "1556281995",
      mode: "JS8",
      senderDXCC: "Finland",
      senderDXCCCode: "OH",
      senderDXCCLocator: "KP33",
      senderEqslAuthGuar: "A",
      sNRString: "-13",
      sNR: -13
    }
  },
  {
    timestamp: "2019-06-03T20:31:30Z",
    freqHz: 7079485,
    sNR: null,
    rxCall: "WB0SIO",
    rxGrid: "EN24WS05SK",
    txCall: "K4WLO",
    txGrid: "EM65WM",
    reportedBy: "N0JUH", // not usually used in PSKReporter data
    srcType: "PSKReporter",
    srcData: {
      receiverCallsign: "WB0SIO",
      receiverLocator: "EN24WS05SK",
      senderCallsign: "K4WLO",
      senderLocator: "EM65WM",
      frequencyHz: 7079485,
      flowStartSeconds: "1556281965",
      mode: "JS8",
      senderDXCC: "United States",
      senderDXCCCode: "K",
      senderDXCCLocator: "EM47",
      sNRString: 'xyz',
      sNR: null
    }
  }
]

export default {
  receptionReportList: receptionReportList
}
