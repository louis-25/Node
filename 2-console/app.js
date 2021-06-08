console.log('hello');
console.clear();

// log level
/* 
로그를 레벨별로 지정할 수 있어서 웹상에서
얼마나 심각한지 정도를 알 수 있게 해준다
*/
console.log('log'); // 개발용
console.info('info'); // 정보
console.warn('warn'); // 경고
console.error('error'); // 에러, 사용자에러, 시스템에러

// assert - 참이 아닌경우만 출력해준다
console.assert(2 === 3, '참이 아닌경우');
console.assert(2 === 2, '참인 경우');

// print object
const student = { name: 'ellie', age: 20};
console.log(student);
console.table(student); // table 모양으로 객체를 보여준다
console.dir(student);

// measuring time 
console.time('for loop'); //시간 측정 시작
for (let i = 0; i < 10; i++) {
    i++;
}
console.timeEnd('for loop'); //시간 측정 종료

// trace
function f1() {
    f2();
}

function f2() {
    f3();
}

function f3() {
    console.log('f3');
    console.trace(); // 현재 함수가 어떻게 호출되었는지 알려준다
}

f1();