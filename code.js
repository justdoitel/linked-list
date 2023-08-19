let linkid = 0;
let idtolink = {}
let overlay = document.getElementById('overlay')
document.querySelector('.card').addEventListener("click",(e)=>{
    e.stopPropagation();
    let task = e.target.id;
    if(task==="append"){
        if(idtolink[e.currentTarget.id].append(overlay.childNodes[1].childNodes[1].value)){
            idtolink[e.currentTarget.id].displayControl.displayNodes();
            overlay.click();
        } else {
            overlay.childNodes[1].childNodes[1].classList.add('error')
        }
    }
    else if(task==="prepend"){
        if(idtolink[e.currentTarget.id].prepend(overlay.childNodes[1].childNodes[1].value)){
            idtolink[e.currentTarget.id].displayControl.displayNodes();
            overlay.click();
        } else {
            overlay.childNodes[1].childNodes[1].classList.add('error')
        }
    }
    else if(task==="removeHead"){
        idtolink[e.currentTarget.id].removeHead()
        idtolink[e.currentTarget.id].displayControl.displayNodes();
        overlay.click();
    }
    else if(task==="removeTail"){
        idtolink[e.currentTarget.id].removeTail()
        idtolink[e.currentTarget.id].displayControl.displayNodes();
        overlay.click();
    }
})

overlay.addEventListener("click",()=>{overlay.classList.remove("active")})

function editlinklist (linkid){
overlay.classList.add("active")
overlay.childNodes[1].id = linkid
overlay.childNodes[1].childNodes[1].value = ''
overlay.childNodes[1].childNodes[1].classList.remove("error")
}

const displayControl = ((linkid,linkedlist) => {
    let pending = [];
    let arrows = [];
    let linkedlistdisplay = document.createElement('div');
    linkedlistdisplay.dataset.linkid = linkid;
    linkedlistdisplay.className = "linked-list";

    const del = new Image();
    del.className = "del";
    del.src = "./del.svg";
    del.addEventListener("click",()=>{
        linkedlistdisplay.nextSibling.remove();
        linkedlistdisplay.remove();
        delete idtolink[linkid];
    })

    linkedlistdisplay.append(del);
    
    document.body.append(linkedlistdisplay);

    let editor = document.createElement('button');
    editor.classList.add('editor');
    editor.textContent = "Alter";

    editor.addEventListener("click",()=>{
        editlinklist(linkid);
    })

    document.body.append(editor);
    
    const createNode = (node) => {
        const div = document.createElement('div')
        div.dataset.nodeid = node.id;
        div.className = "node";

        const value = document.createElement('span')
        value.className = "value";
        value.innerText = node.value;

        const next = document.createElement('span')
        next.className = "next";
        next.innerText = node.next? "ref":"null";
        
        div.append(value)
        div.append(next)

        if(node.next){
            pending.push([node.id,node.next.id])
        }
        return div;
    }

    const addLines = () => {
        arrows.forEach((arrow)=>(arrow.remove()))
        arrows=[];
        for (let arrow of pending){
            arrows.push(arrowLine(`[data-linkid='${linkid}']>[data-nodeid='${arrow[0]}']>.next`, `[data-linkid='${linkid}']>[data-nodeid='${arrow[1]}']>.value`));
        }
        pending = [];
    }

    const displayNodes = () => {
        let temp = linkedlist.head;
        document.querySelectorAll(`[data-linkid='${linkid}']>.node`).forEach(node => node.remove());
        if(temp) linkedlistdisplay.append(createNode(temp))
        else return;
        temp=temp.next;
        while(temp){
            linkedlistdisplay.append(createNode(temp))
            temp=temp.next;
        }
        addLines ();
    }

    return {displayNodes};
});

class Node {
    constructor (value=null,next=null,id){
        this.value = value;
        this.next = next;
        this.id=id;
    }
}

class LinkedList {
    constructor (){
        this.id = linkid++;
        this.head = null;
        this.size = 0;
        this.idgen=0;
        this.displayControl=displayControl(this.id,this);
    }

    get tail (){
        if(this.size===0) return null;
        let temp = this.head;
        while(temp.next) temp=temp.next;
        return temp;
    }

    append(value){ //appends to linked list. returns false if input is not a number
        if(value==="") return false;
        value = Number(value);
        if(isNaN(value)) return false;
        if(this.size===0){
            this.head = new Node(value,null,this.idgen++);
        } else {
            this.tail.next = new Node(value,null,this.idgen++);
        }
        this.size++;
        return true;
    }

    prepend(value){ //prepends to linked list. returns false if input is not a number
        if(value==="") return false;
        value = Number(value);
        if(isNaN(value)) return false;
        if(this.size===0){
            this.head = new Node(value,null,this.idgen++);
        } else {
            let oldhead = this.head;
            this.head = new Node(value,oldhead,this.idgen++);
        }
        this.size++;
        return true;
    }

    toString(){
            let temp = this.head;
            let string = "";
            if(temp) string+=`(${temp.value})`;
            else return;
            temp=temp.next;
            while(temp){
                string+=`->(${temp.value})`
                temp=temp.next;
            }
            return string;
    }

    valueAt(index) { //returns the index. Error: false on invalid index & null on out-of-bound index.
        index = parseInt(index);
        if(isNaN(index)||index<0) return false;
        if(index>=this.size) return null;
        let temp = this.head;
        if(!temp) return null;
        for (let i=0;i<index;i++){
            temp=temp.next;
        }
        return temp.value;
    }

    removeTail(){ //removes tail and return its value. returns null if empty.
        if(this.size<=1) return this.removeHead();
        let temp = this.head;
        while(temp.next.next) temp=temp.next;
        let value = temp.next.value;
        temp.next=null;
        this.size--;
        return value;
    }

    removeHead(){ //removes head and return its value. returns null if empty.
        if(this.size===0) return null;
        let value = this.head.value;
        this.head = this.head.next;
        this.size--;
        return value;
    }

    contains (value){
        let temp = this.head;
        while(temp){
            if(temp.value===value) return true;
            temp=temp.next;
        }
        return false;
    }

    find(value){ //returns false on user error. returns array of indicies.
        value = Number(value);
        if(isNaN(value)) return false;

        let temp = this.head;
        let i = 0;
        let toreturn = [];

        while(temp){
            if(temp.value===value) toreturn.push(i);
            temp=temp.next;
            i++;
        }

        return toreturn;
    }

    insertAt(value,index){ //returns false on invalid value or index.
        value = Number(value);
        index = parseInt(index);
        if(isNaN(value)||isNaN(index)||index<0||index>this.size) return false;

        if(index===0) this.prepend(value);
        else {
            let temp = this.head;
            for (let i=0; i<index-1; i++){
                temp=temp.next;
            }
            let thenext = temp.next;
            temp.next = new Node(value,thenext,this.idgen++);
            this.size++;
        }
    }

    removeAt(index) { //returns false on invalid index. returns value on success
        index = parseInt(index);
        if(isNaN(index)||index<0||index>=this.size) return false;
        if(index===0) return this.removeHead();
        let temp = this.head;
        for (let i=0; i<index-1; i++){
            temp=temp.next;
        }
        let toreturn = temp.next.value;
        temp.next = temp.next.next;
        this.size--;
        return toreturn;
    }
}

document.getElementById('addlinklist').addEventListener("click", ()=>{
    let linkedlist = new LinkedList();
    idtolink[linkedlist.id] = linkedlist;
})