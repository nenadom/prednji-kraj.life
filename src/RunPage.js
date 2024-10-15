import React, { Component } from "react";
import { Button, Progress } from "reactstrap";

import config from "./config";
import ControlsModal from "./ControlsModal";
import Emulator from "./Emulator";
import { loadBinary } from "./utils";

import "./RunPage.css";

/*
 * The UI for the emulator. Also responsible for loading ROM from URL or file.
 */
class RunPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      romName: null,
      romData: null,
      running: false,
      paused: false,
      controlsModalOpen: false,
      loading: true,
      loadedPercent: 3,
      error: null,
      started: false,
    };
  }

  render() {
    return (
      <div className="RunPage">
        <nav
          className="navbar navbar-expand"
          ref={(el) => {
            this.navbar = el;
          }}
        >
          <ul className="navbar-nav ml-auto mr-auto">
            <li className="navitem">
              <span className="navbar-text mr-3">{this.state.romName}</span>
            </li>
          </ul>
          <ul className="navbar-nav" style={{ width: "200px" }}>
            <li className="navitem">
              <Button
                outline
                color="primary"
                onClick={this.toggleControlsModal}
                className="mr-3"
              >
                Controls
              </Button>
              <Button
                outline
                color="primary"
                onClick={this.handlePauseResume}
                disabled={!this.state.running}
              >
                {this.state.paused ? "Resume" : "Pause"}
              </Button>
            </li>
          </ul>
        </nav>

        {this.state.error ? (
          this.state.error
        ) : (
          <div
            className="screen-container"
            ref={(el) => {
              this.screenContainer = el;
            }}
          >
            {this.state.loading ? (
              <Progress
                value={this.state.loadedPercent}
                style={{
                  position: "absolute",
                  width: "70%",
                  left: "15%",
                  top: "48%",
                }}
              />
            ) : this.state.romData ? (
              this.state.started ? (
                <Emulator
                  romData={this.state.romData}
                  paused={this.state.paused}
                  ref={(emulator) => {
                    this.emulator = emulator;
                  }}
                />
              ) : (
                <Button
                  outline
                  size="lg"
                  style={{ marginTop: 200 }}
                  color="primary"
                  onClick={() => {
                    this.setState({ started: true });
                  }}
                >
                  Click here
                </Button>
              )
            ) : null}

            {/* TODO: lift keyboard and gamepad state up */}
            {this.state.controlsModalOpen && (
              <ControlsModal
                isOpen={this.state.controlsModalOpen}
                toggle={this.toggleControlsModal}
                keys={this.emulator.keyboardController.keys}
                setKeys={this.emulator.keyboardController.setKeys}
                promptButton={this.emulator.gamepadController.promptButton}
                gamepadConfig={this.emulator.gamepadController.gamepadConfig}
                setGamepadConfig={
                  this.emulator.gamepadController.setGamepadConfig
                }
              />
            )}
          </div>
        )}
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener("resize", this.layout);
    this.layout();
    this.load();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.layout);
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
  }

  load = () => {
    this.currentRequest = loadBinary(
      config.ROMS.tecmo.url,
      (err, data) => {
        if (err) {
          this.setState({ error: `Error loading ROM: ${err.message}` });
        } else {
          this.handleLoaded(data);
        }
      },
      this.handleProgress
    );
  };

  handleProgress = (e) => {
    if (e.lengthComputable) {
      this.setState({ loadedPercent: (e.loaded / e.total) * 100 });
    }
  };

  handleLoaded = (data) => {
    this.setState({ running: true, loading: false, romData: data });
  };

  handlePauseResume = () => {
    this.setState({ paused: !this.state.paused });
  };

  layout = () => {
    let navbarHeight = parseFloat(window.getComputedStyle(this.navbar).height);
    this.screenContainer.style.height = `${window.innerHeight -
      navbarHeight}px`;
    if (this.emulator) {
      this.emulator.fitInParent();
    }
  };

  toggleControlsModal = () => {
    this.setState({ controlsModalOpen: !this.state.controlsModalOpen });
  };
}

export default RunPage;
