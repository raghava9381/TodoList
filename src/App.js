import React, { Component } from "react";
import "./App.css";
import { PlusIcon, MinusIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { Button } from "./@/components/ui/button"
import { Input } from "./@/components/ui/input"
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

class App extends Component {
  state = {
    ToDoPrimary: '',
    EditText: "",
    ToDoListArray: [],
    isEditOpen: false,
    editIndex: null,
    isDisable: true,
    errorMessage: '',
    records_per_page: 10,
    currentPage: 1,
    originalTodoList: []
  };

  componentDidMount() {
    let todoList = localStorage.getItem('todoList');
    if (todoList) {
      todoList = JSON.parse(todoList);
      this.setState({
        originalTodoList: todoList
      });
      this.changePage(todoList, this.state.currentPage);
    }
  }



  prevPage = () => {
    let { currentPage } = this.state;
    if (currentPage > 1) {
      currentPage = currentPage - 1;
      this.setState({
        currentPage: currentPage
      })
      this.changePage(this.state.originalTodoList, currentPage);
    }
  }

  changePage = (todoList = this.state.originalTodoList, currentPage) => {
    let length = currentPage * this.state.records_per_page;
    let todoItems = [];
    let startIndex = currentPage == 1 ? 1 : ((currentPage - 1) * this.state.records_per_page);
    if (todoList && todoList.length > 0) {
      for (let i = startIndex; i <= length; i++) {
        if (todoList[i]) {
          todoItems.push(todoList[i]);
        }
      }
      this.setState({
        ToDoListArray: todoItems
      })
    }
  }

  nextPage = () => {

    if (this.state.currentPage < this.numPages()) {
      let { currentPage } = this.state;
      currentPage = currentPage + 1;
      this.changePage(this.state.originalTodoList, currentPage);
      this.setState({
        currentPage: currentPage
      })
    }
  }

  numPages = () => {
    return Math.ceil(this.state.originalTodoList.length / this.state.records_per_page);
  }

  // On input value change
  HandleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      isDisable: e.target.value ? false : true,
      errorMessage: ''
    });
  };

  // Add item to to-do list
  HandleAddToDoList = () => {
    let todoList = [...this.state.originalTodoList];
    todoList.push({ name: this.state.ToDoPrimary, completed: false })
    if (!this.checkDuplicates(this.state.ToDoPrimary)) {
      this.updateLocalStorage(todoList);
      this.setState({
        originalTodoList: todoList,
        ToDoPrimary: "",
        isDisable: true
      });
      this.changePage(todoList, this.state.currentPage);

    } else {
      this.setState({
        errorMessage: 'To-do item already exist.'
      })
    }
  };

  // Open edit model to update the to-do item
  HandleEdit = (index) => {
    let ToDoListArray = [...this.state.originalTodoList];
    let editedText = ToDoListArray[index].name;
    this.setState({
      isEditOpen: true,
      editIndex: index,
      EditText: editedText
    });
  };

  // Update to-do item when select update
  HandleUpdate = () => {
    let ToDoListArray = [...this.state.originalTodoList];
    let index = this.state.editIndex;
    ToDoListArray[index] = { ...ToDoListArray[index], name: this.state.EditText };
    if (!this.checkDuplicates(this.state.EditText, 'edit')) {
      this.updateLocalStorage(ToDoListArray);
      this.setState({
        originalTodoList: ToDoListArray,
        isEditOpen: false,
        isDisable: true
      });
      this.changePage(ToDoListArray, this.state.currentPage);
    } else {
      this.setState({
        errorMessage: 'To-do item already exist.'
      })
    }
  };

  // On close update/edit model
  HandleClose = () => {
    this.setState({
      isEditOpen: false,
    });
  };

  // remove to-do item from the list
  HandleDelete = (index) => {
    let ToDoListArray = this.state.originalTodoList;
    ToDoListArray.splice(index, 1);
    this.updateLocalStorage(ToDoListArray);
    this.setState({
      originalTodoList: ToDoListArray,
    });
  };

  // Mark as to-do item completed when select checkbox
  handleTaskCompleted = name => {
    const ToDoListArray = this.state.originalTodoList;
    const index = ToDoListArray.findIndex(task => task.name === name);
    const updatedTasks = [
      ...ToDoListArray.slice(0, index),
      { ...ToDoListArray[index], completed: !ToDoListArray[index].completed },
      ...ToDoListArray.slice(index + 1)
    ];
    this.updateLocalStorage(updatedTasks);
    this.setState({ originalTodoList: updatedTasks });
  };

  // Add/update to-do list in local storage
  updateLocalStorage = (todoList) => {
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  checkDuplicates = (item, mode = 'add') => {
    const ToDoListArray = this.state.originalTodoList;
    const index = ToDoListArray.findIndex(task => task.name === item);
    if (index != -1) {
      if (mode == 'edit' && index == this.state.editIndex) {
        return false
      }
      return true;
    } else {
      return false;
    }
  }

  renderPages = () => {
    let pages = [];
    for (let i = 1; i <= this.numPages(); i++) {
      pages.push(<div key={i} className={`page ${this.state.currentPage == i ? 'active' : ''}`} onClick={() => this.onPageNumberChange(i)}>{i}</div>);
    }
    return pages;
  }

  onPageNumberChange = (page) => {
    this.setState({
      currentPage: page
    });
    this.changePage(this.state.originalTodoList, page)
  }

  render() {
    let response = this.state.ToDoListArray && this.state.ToDoListArray.length > 0 && this.state.ToDoListArray.map((todo, index) => {
      if (index < this.state.records_per_page)
        return (
          <div key={index} className={`mt-3 p-3 flex items-center ${index % 2 == 1 ? 'bg-blue-100' : 'bg-transparent'}`}>
            <div className="text-left w-8">
              <Input
                type="checkbox"
                checked={todo.completed}
                onChange={() => this.handleTaskCompleted(todo.name)}
                className='h-4'
              />
            </div>
            <div className="font-bold text-left w-full pl-4">
              {todo.name}
            </div>
            <div className="text-right w-8">
              <Button variant="outline" onClick={() => this.HandleDelete(index)} className='h-6 px-1 border-black rounded'>
                <MinusIcon />
              </Button>
            </div>
            <div className="text-right w-8">
              <Button variant="outline" onClick={() => this.HandleEdit(index)} className='h-6 px-1 border-black rounded'>
                <Pencil1Icon />
              </Button>
            </div>
          </div>
        );
    });
    return (
      <>
        <div className="App">
          <header>
            <h1 className="font-bold text-3xl">To-Do List</h1>
          </header>

          <div className="m-8 mx-0">
            <div >To-Do*</div>
            <div className="flex mt-3">
              <div className="w-full mr-5">
                <Input
                  type="text"
                  name="ToDoPrimary"
                  placeholder="To-Do"
                  onChange={this.HandleChange}
                  value={this.state.ToDoPrimary}
                  className='border-gray-400 rounded'
                />
                <div className="text-gray-600">Enter the to-do</div>

                {this.state.errorMessage &&
                  <div className='text-red-600'>{this.state.errorMessage}</div>
                }

              </div>
              <div className="text-right mt-2 w-8">
                <Button variant="outline" onClick={this.HandleAddToDoList}
                  className={`h-6 px-1 border-black rounded ${this.state.isDisable ? 'bg-gray-200 cursor-not-allowed border-gray-200 text-gray-400' : ''}`}
                  disabled={this.state.isDisable}>
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-10">
            {response}
          </div>
          {this.state.ToDoListArray && this.state.ToDoListArray.length > 0 &&
            <div className="pagination flex justify-center mt-10">
              <div className="page" onClick={this.prevPage}>&laquo;</div>

              {this.renderPages()}
              <div className="page" onClick={this.nextPage}>&raquo;</div>
            </div>
          }
        </div>
        <Modal open={this.state.isEditOpen} onClose={this.HandleClose} classNames={{ modal: 'customModal', overlay: 'customOverlay', }} center>
          <div className="mb-5">
            <Input
              type="text"
              name="EditText"
              value={this.state.EditText}
              onChange={this.HandleChange}
              className='mt-10'
            />
          </div>
          <div className="text-center">
            <Button className={`rounded border-black ${this.state.isDisable ? 'bg-gray-200 cursor-not-allowed border-gray-200 text-gray-400' : ''}`} onClick={this.HandleUpdate} disabled={this.state.isDisable}
              variant='outline'>
              Update
            </Button>
          </div>
        </Modal>
      </>
    );
  }
}

export default App;