export class AssistantModel {
  constructor(data) {
    this.input = data.input;
    this.response = data.response;
    this.timestamp = new Date();
    this.type = data.type;
  }

  formatResponse() {
    return {
      message: this.response,
      time: this.timestamp.toLocaleTimeString(),
      type: this.type
    };
  }
}