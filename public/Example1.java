public class Example1 {

  public static void main(String args[]){
    int a = 23;
    int b = 12;
    int c = a + b*3;
    boolean m;
    if (a < 12)
      m = true;
    else
      m = false;
    int d;
    if(m) {
      d = 1 + 10 + c;
    } else {
      d = 276 + b;
    }
  }
}