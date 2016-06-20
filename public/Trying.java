public class Trying {
  
   private final int f1;
	private final float f2;

	Trying (int f1, float f2){
		this.f1 = f1;
		this.f2 = f2;
	}


	public static void main(String[] args){
     
      int[] is = new int[3];
      int[] js = new int[2];
      Integer a = 45;
      Integer aa = new Integer(46);
      String h = "h";
      String hh = new String("hh");
     
		int ivar1 = 12;
		ivar1 = 49;
		int ivar2 = ivar1 + 15;
		float f = ivar1 + ivar2;

		Trying[] as = new Trying[5];
		for (int i = 0; i < as.length; i++) {
        new Object();
			as[i] = new Trying(i, f++);
		}
     

		int i = 0;
		while (true){
			if (i == 5)
				break;

			as[i].f(i);
			i++;
		}
	}

	public int f(int arg){
		return arg + 1;
	}
   
}