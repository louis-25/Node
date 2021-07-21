/* this는 문맥에 따라 의미가 달라진다 */

function hello() {
    console.log(this); //this는 global이다
    console.log(this === global);
}

hello();

class A {
    constructor(num) {
        this.num = num;
    }
    memberFunction() {
        console.log('--------class------------');
        console.log(this); //클래스 자기 자신을 가리킨다
        console.log(this === global);
    }
}

const a = new A(1);
a.memberFunction();

console.log('------ global scope ------');
console.log(this);
console.log(this === module.exports);