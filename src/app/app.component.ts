import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as uuid from 'uuid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  CLUSTER_BUTTONS_PER_ROW = 15;
  CLUSTER_ROWS = 3;
  CLUSTER_DEPTH = 3;

  CLUSTER_BUTTONS = new Array();

  currentlySelectedButtonId: string = '';

  constructor() {
    // Create a 3D array of buttons
    for (let x_pos = 0; x_pos < this.CLUSTER_BUTTONS_PER_ROW; x_pos++) {
      this.CLUSTER_BUTTONS[x_pos] = [];
      for (let z_pos = 0; z_pos < this.CLUSTER_DEPTH; z_pos++) {
        this.CLUSTER_BUTTONS[x_pos][z_pos] = [];
        for (let y_pos = 0; y_pos < this.CLUSTER_ROWS; y_pos++) {
          this.CLUSTER_BUTTONS[x_pos][z_pos][y_pos] = {
            x: x_pos,
            y: y_pos,
            z: z_pos,
            id: uuid.v4(),
            chord: this.getChord(x_pos, y_pos, z_pos),
          };
        }
      }
    }
    setTimeout(() => {
      for (let x_pos = 0; x_pos < this.CLUSTER_BUTTONS_PER_ROW; x_pos++) {
        for (let y_pos = 0; y_pos < this.CLUSTER_ROWS; y_pos++) {
          for (let z_pos = 0; z_pos < this.CLUSTER_DEPTH; z_pos++) {
            const button = this.CLUSTER_BUTTONS[x_pos][y_pos][z_pos];
            if (!button) {
              continue;
            }

            const element = document.getElementById(button.id);
            if (element) {
              element.setAttribute(
                'position',
                `${button.x} ${button.y} ${button.z}`
              );
            }
          }
        }
      }
    });
  }

  onButtonClick(button: any) {
    if (this.currentlySelectedButtonId) {
      const previouslySelectedButton = document.getElementById(
        this.currentlySelectedButtonId
      );
      if (previouslySelectedButton) {
        previouslySelectedButton.setAttribute('color', '#4CC3D9');
      }
    }

    this.currentlySelectedButtonId = button.id;
    const currentlySelectedButton = document.getElementById(
      this.currentlySelectedButtonId
    );

    if (currentlySelectedButton) {
      currentlySelectedButton.setAttribute('color', 'red');
    }

    const buttonsThatShareOneNote = this.findChordsWithSameNotes(
      button.chord,
      1
    );
    const buttonsThatShareTwoNotes = this.findChordsWithSameNotes(
      button.chord,
      2
    );
    const buttonsThatShareThreeNotes = this.findChordsWithSameNotes(
      button.chord,
      3
    );

    //reset all buttons to default color
    for (let x_pos = 0; x_pos < this.CLUSTER_BUTTONS_PER_ROW; x_pos++) {
      for (let y_pos = 0; y_pos < this.CLUSTER_ROWS; y_pos++) {
        for (let z_pos = 0; z_pos < this.CLUSTER_DEPTH; z_pos++) {
          const button = this.CLUSTER_BUTTONS[x_pos][y_pos][z_pos];
          if (!button) {
            continue;
          }

          this.highlightButton(button.id, '#9fa1a6');
        }
      }
    }

    for (let i = 0; i < buttonsThatShareOneNote.length; i++) {
      this.highlightButton(buttonsThatShareOneNote[i], '#fcb251');
    }

    for (let i = 0; i < buttonsThatShareTwoNotes.length; i++) {
      this.highlightButton(buttonsThatShareTwoNotes[i], '#c105ff');
    }

    for (let i = 0; i < buttonsThatShareThreeNotes.length; i++) {
      this.highlightButton(buttonsThatShareThreeNotes[i], '#ff0000');
    }
  }

  private getChord(x: number, y: number, z: number): number[] {
    let chord: number[] = [];

    switch (true) {
      case this.compareArrays([y, z], [0, 0]):
        chord = [(x % 7) - 1, (x % 7) + 2, (x % 7) + 1 + 4];
        break;
      case this.compareArrays([y, z], [0, 1]):
        chord = [(x % 7) + 1, (x % 7) + 2, (x % 7) + 1 + 4];
        break;
      case this.compareArrays([y, z], [0, 2]):
        chord = [(x % 7) + 1, (x % 7) + 2 + 2, (x % 7) + 1 + 4];
        break;
      case this.compareArrays([y, z], [1, 0]):
        chord = [x % 7, (x % 7) + 2, (x % 7) + 1 + 4];
        break;
      case this.compareArrays([y, z], [1, 1]):
        chord = [(x % 7) + 1, (x % 7) + 1 + 2, (x % 7) + 1 + 4];
        break;
      case this.compareArrays([y, z], [1, 2]):
        chord = [(x % 7) + 1, (x % 7) + 2 + 2, (x % 7) + 2 + 4];
        break;
      case this.compareArrays([y, z], [2, 0]):
        chord = [(x % 7) + 1, (x % 7) + 2, (x % 7) + 1 + 4];
        break;
      case this.compareArrays([y, z], [2, 1]):
        chord = [(x % 7) + 1, (x % 7) + 2 + 2, (x % 7) + 1 + 4];
        break;
      case this.compareArrays([y, z], [2, 2]):
        chord = [(x % 7) + 1, (x % 7) + 2 + 2, (x % 7) + 3 + 4];
        break;
    }

    for (let i = 0; i < chord.length; i++) {
      if (chord[i] > 7) {
        chord[i] += -7;
      }

      if (chord[i] <= 0) {
        chord[i] += 7;
      }
    }

    return chord;
  }

  compareArrays(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  }

  compareChords(arr1: number[], arr2: number[]): number {
    let number_of_same_notes = 0;

    for (let i = 0; i < arr1.length; i++) {
      if (arr2.includes(arr1[i])) {
        number_of_same_notes++;
      }
    }
    console.log(arr1, arr2, number_of_same_notes);
    return number_of_same_notes;
  }

  findChordsWithSameNotes(
    chord: number[],
    number_of_same_notes: number
  ): string[] {
    //iterate over buttons, and compare chords. If number of same notes is equal to number_of_same_notes, add button's ID to array
    let buttons = [];
    for (let x_pos = 0; x_pos < this.CLUSTER_BUTTONS_PER_ROW; x_pos++) {
      for (let y_pos = 0; y_pos < this.CLUSTER_ROWS; y_pos++) {
        for (let z_pos = 0; z_pos < this.CLUSTER_DEPTH; z_pos++) {
          const button = this.CLUSTER_BUTTONS[x_pos][y_pos][z_pos];
          if (!button) {
            continue;
          }

          if (this.compareChords(chord, button.chord) >= number_of_same_notes) {
            buttons.push(button.id);
          }
        }
      }
    }
    return buttons;
  }

  highlightButton(buttonId: string, color: string) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.setAttribute('color', color);
    }
  }
}
