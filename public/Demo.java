public class Demo {

  public static class A {
    
    private final int f1;
  	 private final float f2;
    
    public A (int f1, float f2){
    	this.f1 = f1;
    	this.f2 = f2;
  	 }
    
    public int f(int arg){
    	return arg + 1;
  	 }
  }
  
  public static class B {
    
    private int a, b;
    
    public B(int x) {
      a = x;
      b = x*2;
    }
  }
  
	public static void main(String[] args) {
     
     int[] is = new int[3];
    int[] js = new int[2];
     int k = 0;
     while (k<is.length) {
      is[k] = k+1;
      k++;
    }
     
     
		Integer a = 46;
		Integer b = new Integer(23);
     String str = "HI";
		
		if (a == b)
			System.out.println("a and b are equal!");
		else
			System.out.println("a and b are NOT equal!!");
     
     
     int x = 12;
    x = 49;
    B ff = new B(42);
    int y = x + 15;
    float f = x + y;

    A[] as = new A[5];
    for (int i = 0; i < as.length; i++) {
    	as[i] = new A(i, f++);
    }

    int i = 0;
    while (true){
      if (i == 5)
      	break;

      as[i].f(i);
      i++;
    }
	}
}
