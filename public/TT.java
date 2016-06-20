package ch.usi.inf.sape.blast.javac;

public class TT {

	private final int f1;
	private final float f2;

	A (int f1, float f2){
		this.f1 = f1;
		this.f2 = f2;
	}


	public static void main(String[] args){
		int ivar1 = 12;
		ivar1 = 49;
		int ivar2 = ivar1 + 15;
		float f = ivar1 + ivar2;

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

	public int f(int arg){
		return arg + 1;
	}
}